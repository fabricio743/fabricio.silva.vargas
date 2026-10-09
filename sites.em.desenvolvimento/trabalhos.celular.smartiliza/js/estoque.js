
/* ==========================================
   SMARTILIZA — CONTROLE DE ESTOQUE
   Usa a URL centralizada em js/config.js
========================================== */

const URL_SCRIPT = CONFIG.URL_SCRIPT;

let pecasCarregadas = [];
let marcasCarregadas = [];
let modoCadastro = "individual";

const $ = id => document.getElementById(id);


/* ---------- FUNÇÕES AUXILIARES ---------- */

function escapar(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caractere]);
}

function dinheiro(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function dataHora(valor) {
    if (!valor) return "Data não informada";

    const data = new Date(valor);

    return Number.isNaN(data.getTime())
        ? String(valor)
        : data.toLocaleString("pt-BR");
}

function mostrarMensagem(mensagem, erro = false) {
    let aviso = $("avisoEstoque");

    if (!aviso) {
        aviso = document.createElement("div");
        aviso.id = "avisoEstoque";
        aviso.setAttribute("role", "status");

        const container = document.querySelector(".estoque-container");
        (container || document.body).prepend(aviso);
    }

    aviso.textContent = mensagem;
    aviso.style.cssText = `
        padding: 12px;
        margin: 12px 0;
        border-radius: 6px;
        background: ${erro ? "#ffe5e5" : "#e5f5e8"};
        color: ${erro ? "#a00000" : "#176b2c"};
    `;

    aviso.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}

async function getAPI(action, parametros = {}) {
    const query = new URLSearchParams({
        action,
        ...parametros
    });

    const resposta = await fetch(`${URL_SCRIPT}?${query.toString()}`);

    if (!resposta.ok) {
        throw new Error("Falha na comunicação com o servidor.");
    }

    return resposta.json();
}

async function postAPI(dados) {
    const resposta = await fetch(URL_SCRIPT, {
        method: "POST",
        body: JSON.stringify(dados)
    });

    if (!resposta.ok) {
        throw new Error("Falha ao enviar os dados.");
    }

    return resposta.json();
}


/* ---------- PREPARAÇÃO DO CADASTRO ---------- */


function prepararAreaCadastro() {
    const area = $("areaCadastroPeca");
    if (!area) return;

    // A área da página não precisa mais exibir os formulários.
    area.innerHTML = "";

    // Mantém a estrutura de modal separada do conteúdo da página.
    let modal = $("modalCadastroEstoque");

    if (!modal) {
        modal = document.createElement("div");
        modal.id = "modalCadastroEstoque";
        modal.className = "modal";
        modal.setAttribute("aria-hidden", "true");

        modal.innerHTML = `
            <div
                class="modal-conteudo modal-estoque-conteudo"
                role="dialog"
                aria-modal="true"
                aria-labelledby="tituloModalEstoque"
            >
                <div class="modal-topo">
                    <div>
                        <h2 id="tituloModalEstoque">Cadastrar peça</h2>
                        <p>Preencha os dados para atualizar o estoque.</p>
                    </div>

                    <button
                        type="button"
                        class="btn-fechar-modal"
                        id="fecharModalEstoque"
                        aria-label="Fechar janela"
                    >×</button>
                </div>

                <div id="conteudoModalEstoque"></div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    $("fecharModalEstoque").addEventListener("click", fecharModalEstoque);

    modal.addEventListener("click", evento => {
        if (evento.target === modal) fecharModalEstoque();
    });

    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape" && modal.classList.contains("ativo")) {
            fecharModalEstoque();
        }
    });

    const btnIndividual = $("btnCadastroIndividual");
    const btnLote = $("btnCadastroLote");

    if (btnIndividual) {
        btnIndividual.addEventListener("click", () => {
            modoCadastro = "individual";
            mostrarFormularioIndividual();
        });
    }

    if (btnLote) {
        btnLote.addEventListener("click", () => {
            modoCadastro = "lote";
            mostrarFormularioLote();
        });
    }

    let btnMarcas = $("btnGerenciarMarcas");

    if (!btnMarcas) {
        btnMarcas = document.createElement("button");
        btnMarcas.id = "btnGerenciarMarcas";
        btnMarcas.type = "button";
        btnMarcas.className = "btn-secundario";
        btnMarcas.textContent = "Gerenciar marcas";
        area.appendChild(btnMarcas);
    }

    btnMarcas.addEventListener("click", gerenciarMarcasUI);
}

function abrirModalEstoque(titulo, descricao = "") {
    const modal = $("modalCadastroEstoque");
    if (!modal) return;

    $("tituloModalEstoque").textContent = titulo;

    const paragrafo = modal.querySelector(".modal-topo p");
    if (paragrafo) paragrafo.textContent = descricao;

    modal.classList.add("ativo");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-estoque-aberto");
}

function fecharModalEstoque() {
    const modal = $("modalCadastroEstoque");
    if (!modal) return;

    modal.classList.remove("ativo");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-estoque-aberto");
}

function exibirFormularioModal(html, titulo, descricao = "") {
    const conteudo = $("conteudoModalEstoque");
    if (!conteudo) return;

    conteudo.innerHTML = html;
    abrirModalEstoque(titulo, descricao);
}

function opcoesMarcas() {
    return marcasCarregadas.map(marca => `
        <option value="${escapar(marca)}">${escapar(marca)}</option>
    `).join("");
}

function mostrarFormularioIndividual() {
    exibirFormularioModal(`
        <form id="formPecaIndividual" class="estoque-formulario">

            <div class="campo">
                <label for="marcaPeca">Marca</label>
                <select id="marcaPeca" required>
                    <option value="">Selecione uma marca</option>
                    ${opcoesMarcas()}
                </select>
            </div>

            <div class="campo">
                <label for="modeloPeca">Modelo compatível</label>
                <input id="modeloPeca" type="text" required>
            </div>

            <div class="campo completo">
                <label for="nomePeca">Nome da peça</label>
                <input id="nomePeca" type="text" required>
            </div>

            <div class="campo">
                <label for="quantidadePeca">Quantidade</label>
                <input id="quantidadePeca" type="number"
                    min="1" step="1" required>
            </div>

            <div class="campo">
                <label for="custoUnitarioPeca">Custo unitário (R$)</label>
                <input id="custoUnitarioPeca" type="number"
                    min="0" step="0.01" required>
            </div>

            <div class="campo">
                <label for="fornecedorPeca">Fornecedor</label>
                <input id="fornecedorPeca" type="text">
            </div>

            <div class="campo completo">
                <label for="observacaoPeca">Observações</label>
                <textarea id="observacaoPeca"></textarea>
            </div>

            <div class="modal-acoes campo completo">
                <button type="button" class="btn-secundario"
                    id="cancelarCadastroPeca">Cancelar</button>
                <button type="submit" id="btnSalvarPeca">
                    Salvar entrada
                </button>
            </div>
        </form>
    `, "Cadastro individual", "Informe os dados da peça que deseja adicionar.");

    $("formPecaIndividual").addEventListener("submit", salvarPecaIndividual);
    $("cancelarCadastroPeca").addEventListener("click", fecharModalEstoque);
}

async function salvarPecaIndividual(evento) {
    evento.preventDefault();

    const botao = $("btnSalvarPeca");
    botao.disabled = true;

    const dados = {
        action: "cadastrarItemEstoque",
        marca: $("marcaPeca").value,
        modelo: $("modeloPeca").value.trim(),
        peca: $("nomePeca").value.trim(),
        quantidade: $("quantidadePeca").value,
        custoUnitario: $("custoUnitarioPeca").value,
        fornecedor: $("fornecedorPeca").value.trim(),
        observacao: $("observacaoPeca").value.trim()
    };

    try {
        const resultado = await postAPI(dados);

        if (!resultado.sucesso) {
            throw new Error(resultado.mensagem || "Erro ao salvar a peça.");
        }

        mostrarMensagem(resultado.mensagem || "Peça salva com sucesso!");

        fecharModalEstoque();
        await atualizarTudo();

    } catch (erro) {
        console.error("Erro ao salvar peça:", erro);
        mostrarMensagem(erro.message || "Erro ao salvar a peça.", true);

    } finally {
        botao.disabled = false;
    }
}


/* ---------- CADASTRO EM LOTE ---------- */

function mostrarFormularioLote() {
    exibirFormularioModal(`
        <form id="formPecaLote">
            <div id="linhasLote"></div>

            <div class="estoque-acoes-cadastro">
                <button type="button" class="btn-secundario"
                    id="btnAdicionarLinha">
                    + Adicionar outra peça
                </button>
            </div>

            <div class="modal-acoes">
                <button type="button" class="btn-secundario"
                    id="cancelarLote">Cancelar</button>
                <button type="submit" id="btnSalvarLote">
                    Salvar todas as peças
                </button>
            </div>
        </form>
    `, "Cadastro em lote", "Cadastre várias peças na mesma operação.");

    adicionarLinhaLote();
    adicionarLinhaLote();

    $("btnAdicionarLinha").addEventListener("click", adicionarLinhaLote);
    $("cancelarLote").addEventListener("click", fecharModalEstoque);
    $("formPecaLote").addEventListener("submit", salvarLote);
}

function adicionarLinhaLote() {
    const area = $("linhasLote");
    if (!area) return;

    const linha = document.createElement("fieldset");
    linha.className = "linha-lote";

    linha.style.cssText = `
        border: 1px solid #ccc;
        border-radius: 6px;
        padding: 12px;
        margin: 12px 0;
    `;

    linha.innerHTML = `
        <legend>Peça</legend>

        <label class="estoque-campo">
            Marca
            <select class="lote-marca" required>
                <option value="">Selecione</option>
                ${opcoesMarcas()}
            </select>
        </label>

        <label class="estoque-campo">
            Modelo compatível
            <input class="lote-modelo" required>
        </label>

        <label class="estoque-campo">
            Nome da peça
            <input class="lote-peca" required>
        </label>

        <label class="estoque-campo">
            Quantidade
            <input
                class="lote-quantidade"
                type="number"
                min="1"
                step="1"
                required
            >
        </label>

        <label class="estoque-campo">
            Custo unitário (R$)
            <input
                class="lote-custo"
                type="number"
                min="0"
                step="0.01"
                required
            >
        </label>

        <label class="estoque-campo">
            Fornecedor
            <input class="lote-fornecedor">
        </label>

        <label class="estoque-campo">
            Observações
            <input class="lote-observacao">
        </label>

        <button type="button" class="btn-remover-linha">
            Remover linha
        </button>
    `;

    linha.querySelector(".btn-remover-linha").addEventListener(
        "click",
        () => {
            if (area.children.length <= 1) {
                mostrarMensagem(
                    "Mantenha pelo menos uma linha.",
                    true
                );
                return;
            }

            linha.remove();
        }
    );

    area.appendChild(linha);
}

async function salvarLote(evento) {
    evento.preventDefault();

    const botao = $("btnSalvarLote");
    botao.disabled = true;

    const itens = Array.from(
        document.querySelectorAll(".linha-lote")
    ).map(linha => ({
        marca: linha.querySelector(".lote-marca").value,
        modelo: linha.querySelector(".lote-modelo").value.trim(),
        peca: linha.querySelector(".lote-peca").value.trim(),
        quantidade: linha.querySelector(".lote-quantidade").value,
        custoUnitario: linha.querySelector(".lote-custo").value,
        fornecedor: linha.querySelector(".lote-fornecedor").value.trim(),
        observacao: linha.querySelector(".lote-observacao").value.trim()
    }));

    try {
        const resultado = await postAPI({
            action: "cadastrarLoteEstoque",
            itens: itens
        });

        if (Number(resultado.cadastrados) > 0) {
            await atualizarTudo();
        }

        if (resultado.erros?.length) {
            const detalhes = resultado.erros.map(item =>
                `Linha ${item.indice + 1}: ${item.mensagem}`
            ).join(" | ");

            mostrarMensagem(
                `${resultado.mensagem} ${detalhes}`,
                true
            );

        } else if (!resultado.sucesso) {
            throw new Error(resultado.mensagem || "Erro ao salvar o lote.");

        } else {
            mostrarMensagem(resultado.mensagem || "Lote salvo.");
            fecharModalEstoque();
        }

    } catch (erro) {
        console.error("Erro no cadastro em lote:", erro);
        mostrarMensagem(erro.message || "Erro ao salvar o lote.", true);

    } finally {
        botao.disabled = false;
    }
}


/* ---------- MARCAS ---------- */

async function carregarMarcas() {
    const resultado = await getAPI("listarMarcas");

    if (resultado.sucesso === false) {
        throw new Error(resultado.mensagem || "Erro ao carregar marcas.");
    }

    marcasCarregadas = resultado.marcas || [];
}

async function gerenciarMarcasUI() {
    const nome = prompt(
        "Digite o nome da marca que deseja adicionar ou reativar:"
    );

    if (nome === null) return;

    if (!nome.trim()) {
        mostrarMensagem("Informe um nome de marca válido.", true);
        return;
    }

    try {
        const resultado = await postAPI({
            action: "gerenciarMarca",
            operacao: "adicionar",
            marca: nome.trim()
        });

        if (!resultado.sucesso) {
            throw new Error(resultado.mensagem || "Erro ao salvar a marca.");
        }

        await carregarMarcas();

        if (modoCadastro === "lote") {
            mostrarFormularioLote();
        } else {
            mostrarFormularioIndividual();
        }

        mostrarMensagem(resultado.mensagem || "Marca salva.");

    } catch (erro) {
        console.error("Erro ao gerenciar marca:", erro);
        mostrarMensagem(erro.message || "Erro ao salvar a marca.", true);
    }
}


/* ---------- LISTAGEM DO ESTOQUE ---------- */

async function carregarEstoque() {
    const lista = $("listaEstoque");
    if (!lista) return;

    lista.innerHTML = "<p>Carregando estoque...</p>";

    const resultado = await getAPI("listarEstoque");

    if (resultado.sucesso === false) {
        throw new Error(resultado.mensagem || "Erro ao carregar estoque.");
    }

    pecasCarregadas = resultado.itens || [];

    if ($("totalPecas")) {
        $("totalPecas").textContent = pecasCarregadas.length;
    }

    if ($("totalUnidades")) {
        $("totalUnidades").textContent = pecasCarregadas.reduce(
            (total, item) => total + Number(item.quantidade || 0),
            0
        );
    }

    renderizarPecas(lista, pecasCarregadas, false);

    // Atualiza também os resultados da pesquisa.
    const campoPesquisa = $("pesquisaPeca");

    if (campoPesquisa && campoPesquisa.value.trim()) {
        renderizarPesquisa();
    }
}

function renderizarPecas(container, itens, pesquisa = false) {
    if (!container) return;

    if (!itens.length) {
        container.innerHTML = pesquisa
            ? "<p>Nenhuma peça disponível corresponde à pesquisa.</p>"
            : "<p>Nenhuma peça disponível no estoque.</p>";
        return;
    }

    container.innerHTML = itens.map(item => `
        <article class="estoque-item" style="
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 14px;
            margin: 10px 0;
        ">
            <h3>${escapar(item.marca)}</h3>

            <p><strong>Modelo:</strong> ${escapar(item.modelo)}</p>
            <p><strong>Peça:</strong> ${escapar(item.peca)}</p>
            <p><strong>Quantidade:</strong> ${Number(item.quantidade)}</p>
            <p><strong>Custo médio unitário:</strong> ${dinheiro(item.custoMedio)}</p>

            ${item.observacao
                ? `<p><strong>Observações:</strong> ${escapar(item.observacao)}</p>`
                : ""}

            <div class="estoque-acoes-cadastro">
                <button type="button" data-entrada="${escapar(item.id)}">
                    Repor estoque
                </button>

                <button type="button" data-saida="${escapar(item.id)}">
                    Registrar saída
                </button>
            </div>
        </article>
    `).join("");

    container.querySelectorAll("[data-entrada]").forEach(botao => {
        botao.addEventListener("click", () => {
            registrarEntradaUI(botao.dataset.entrada);
        });
    });

    container.querySelectorAll("[data-saida]").forEach(botao => {
        botao.addEventListener("click", () => {
            registrarSaidaUI(botao.dataset.saida);
        });
    });
}


/* ---------- REPOSIÇÃO ---------- */

async function registrarEntradaUI(id) {
    const item = pecasCarregadas.find(
        peca => String(peca.id) === String(id)
    );

    if (!item) return;

    const quantidade = prompt(
        `Quantidade que entrou de ${item.peca}:`
    );

    if (quantidade === null) return;

    const custoUnitario = prompt(
        "Custo unitário pago nesta compra (R$):"
    );

    if (custoUnitario === null) return;

    const fornecedor = prompt("Fornecedor (opcional):") || "";
    const observacao = prompt("Observações (opcional):") || "";

    try {
        const resultado = await postAPI({
            action: "registrarEntrada",
            pecaId: id,
            quantidade: quantidade,
            custoUnitario: custoUnitario,
            fornecedor: fornecedor,
            observacao: observacao
        });

        if (!resultado.sucesso) {
            throw new Error(resultado.mensagem || "Erro ao registrar entrada.");
        }

        mostrarMensagem(resultado.mensagem || "Entrada registrada.");
        await atualizarTudo();

    } catch (erro) {
        console.error("Erro ao repor estoque:", erro);
        mostrarMensagem(erro.message || "Erro ao registrar entrada.", true);
    }
}


/* ---------- SAÍDA ---------- */

async function registrarSaidaUI(id) {
    const item = pecasCarregadas.find(
        peca => String(peca.id) === String(id)
    );

    if (!item) return;

    const quantidade = prompt(
        `Quantidade que saiu de ${item.peca}. Disponível: ${item.quantidade}`
    );

    if (quantidade === null) return;

    const motivo = prompt(
        "Motivo da saída (venda, uso em assistência, perda etc.):"
    ) || "";

    const observacao = prompt("Observações (opcional):") || "";

    try {
        const resultado = await postAPI({
            action: "registrarSaida",
            pecaId: id,
            quantidade: quantidade,
            motivo: motivo,
            observacao: observacao
        });

        if (!resultado.sucesso) {
            throw new Error(resultado.mensagem || "Erro ao registrar saída.");
        }

        mostrarMensagem(resultado.mensagem || "Saída registrada.");
        await atualizarTudo();

    } catch (erro) {
        console.error("Erro ao registrar saída:", erro);
        mostrarMensagem(erro.message || "Erro ao registrar saída.", true);
    }
}


/* ---------- PESQUISA ---------- */

function configurarPesquisa() {
    const campoPesquisa = $("pesquisaPeca");

    if (!campoPesquisa) return;

    campoPesquisa.addEventListener("input", renderizarPesquisa);
}

function renderizarPesquisa() {
    const campoPesquisa = $("pesquisaPeca");
    const resultado = $("resultadoPesquisa");

    if (!campoPesquisa || !resultado) return;

    const termo = campoPesquisa.value.trim().toLocaleLowerCase("pt-BR");

    const filtradas = pecasCarregadas.filter(item => {
        const texto = [
            item.marca,
            item.modelo,
            item.peca
        ].join(" ").toLocaleLowerCase("pt-BR");

        return texto.includes(termo) && Number(item.quantidade) > 0;
    });

    renderizarPecas(resultado, filtradas, true);
}


/* ---------- HISTÓRICO ---------- */

async function carregarHistorico() {
    const lista = $("listaHistorico");
    if (!lista) return;

    lista.innerHTML = "<p>Carregando histórico...</p>";

    const busca = $("filtroHistorico")?.value?.trim() || "";
    const resultado = await getAPI("listarHistorico", { busca: busca });

    if (resultado.sucesso === false) {
        throw new Error(resultado.mensagem || "Erro ao carregar histórico.");
    }

    const movimentacoes = resultado.movimentacoes || [];

    if (!movimentacoes.length) {
        lista.innerHTML = "<p>Nenhuma movimentação encontrada.</p>";
        return;
    }

    lista.innerHTML = movimentacoes.map(item => `
        <article class="estoque-item" style="
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 14px;
            margin: 10px 0;
        ">
            <h3>${escapar(item.tipo)} — ${escapar(item.peca)}</h3>

            <p><strong>Data:</strong> ${escapar(dataHora(item.data))}</p>
            <p><strong>Marca:</strong> ${escapar(item.marca)}</p>
            <p><strong>Modelo:</strong> ${escapar(item.modelo)}</p>
            <p><strong>Quantidade:</strong> ${Number(item.quantidade)}</p>

            ${item.tipo === "Entrada"
                ? `<p><strong>Custo unitário da compra:</strong> ${dinheiro(item.custoUnitario)}</p>`
                : ""}

            ${item.fornecedor
                ? `<p><strong>Fornecedor:</strong> ${escapar(item.fornecedor)}</p>`
                : ""}

            ${item.motivo
                ? `<p><strong>Motivo:</strong> ${escapar(item.motivo)}</p>`
                : ""}

            ${item.observacao
                ? `<p><strong>Observações:</strong> ${escapar(item.observacao)}</p>`
                : ""}
        </article>
    `).join("");
}


/* ---------- ATUALIZAÇÃO ---------- */

async function atualizarTudo() {
    const resultados = await Promise.allSettled([
        carregarEstoque(),
        carregarHistorico()
    ]);

    const erros = resultados.filter(
        resultado => resultado.status === "rejected"
    );

    if (erros.length) {
        console.error("Erro ao atualizar estoque:", erros);
        mostrarMensagem(
            erros[0].reason?.message || "Erro ao atualizar os dados.",
            true
        );
    }
}


/* ---------- INICIALIZAÇÃO ---------- */

async function iniciarEstoque() {
    prepararAreaCadastro();
    configurarPesquisa();

    const btnAtualizar = $("btnAtualizarEstoque");

    if (btnAtualizar) {
        btnAtualizar.addEventListener("click", atualizarTudo);
    }

    const filtroHistorico = $("filtroHistorico");

    if (filtroHistorico) {
        filtroHistorico.addEventListener("input", () => {
            carregarHistorico().catch(erro => {
                mostrarMensagem(
                    erro.message || "Erro ao carregar histórico.",
                    true
                );
            });
        });
    }

    try {
        await carregarMarcas();
        mostrarFormularioIndividual();
        await atualizarTudo();

    } catch (erro) {
        console.error("Erro ao iniciar estoque:", erro);

        mostrarMensagem(
            erro.message ||
            "Não foi possível conectar ao estoque. Confira a URL e a implantação do Apps Script.",
            true
        );
    }
}

document.addEventListener("DOMContentLoaded", iniciarEstoque);