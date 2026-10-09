document.addEventListener("DOMContentLoaded", iniciarEstoque);

let pecasCarregadas = [];
let marcasCarregadas = [];
let modoCadastro = "individual";

const $ = (id) => document.getElementById(id);

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
    if (Number.isNaN(data.getTime())) return String(valor);

    return data.toLocaleString("pt-BR");
}

async function getAPI(action, parametros = {}) {
    const query = new URLSearchParams({
        action,
        ...parametros
    });

    const resposta = await fetch(`${URL_SCRIPT}?${query.toString()}`);
    if (!resposta.ok) throw new Error("Falha na comunicação com o servidor.");

    return resposta.json();
}

async function postAPI(dados) {
    const resposta = await fetch(URL_SCRIPT, {
        method: "POST",
        body: JSON.stringify(dados)
    });

    if (!resposta.ok) throw new Error("Falha ao enviar os dados.");

    return resposta.json();
}

function mostrarMensagem(mensagem, erro = false) {
    let aviso = $("avisoEstoque");

    if (!aviso) {
        aviso = document.createElement("div");
        aviso.id = "avisoEstoque";
        aviso.setAttribute("role", "status");

        const container = document.querySelector(".estoque-container");
        if (container) container.prepend(aviso);
        else document.body.prepend(aviso);
    }

    aviso.textContent = mensagem;
    aviso.style.cssText = `
        padding: 12px;
        margin: 12px 0;
        border-radius: 6px;
        background: ${erro ? "#ffe5e5" : "#e5f5e8"};
        color: ${erro ? "#a00000" : "#176b2c"};
    `;

    aviso.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function campo(label, id, tipo = "text", obrigatorio = true) {
    return `
        <label class="estoque-campo">
            ${escapar(label)}
            <input
                id="${escapar(id)}"
                name="${escapar(id)}"
                type="${escapar(tipo)}"
                ${obrigatorio ? "required" : ""}
                ${tipo === "number" ? 'min="0" step="any"' : ""}
            >
        </label>
    `;
}


function montarCadastro() {
    const area = $("areaCadastroPeca");
    if (!area) {
        console.error('Elemento "areaCadastroPeca" não encontrado no HTML.');
        return;
    }

    // Preserva os botões que já existem no HTML.
    let formulario = $("formularioCadastro");

    if (!formulario) {
        formulario = document.createElement("div");
        formulario.id = "formularioCadastro";
        area.appendChild(formulario);
    }

    const btnIndividual = $("btnCadastroIndividual");
    const btnLote = $("btnCadastroLote");

    if (btnIndividual) {
        btnIndividual.addEventListener("click", () => {
            modoCadastro = "individual";
            mostrarFormularioIndividual();
        });
    } else {
        console.error('Botão "btnCadastroIndividual" não encontrado.');
    }

    if (btnLote) {
        btnLote.addEventListener("click", () => {
            modoCadastro = "lote";
            mostrarFormularioLote();
        });
    } else {
        console.error('Botão "btnCadastroLote" não encontrado.');
    }

    // Cria o botão de marcas apenas se ainda não existir.
    let btnMarcas = $("btnGerenciarMarcas");

    if (!btnMarcas) {
        btnMarcas = document.createElement("button");
        btnMarcas.id = "btnGerenciarMarcas";
        btnMarcas.type = "button";
        btnMarcas.textContent = "Gerenciar marcas";
        area.appendChild(btnMarcas);
    }

    btnMarcas.addEventListener("click", gerenciarMarcasUI);

    mostrarFormularioIndividual();
}

function opcoesMarcas() {
    return marcasCarregadas.map(marca => `
        <option value="${escapar(marca)}">${escapar(marca)}</option>
    `).join("");
}

function mostrarFormularioIndividual() {
    const area = $("formularioCadastro");
    if (!area) return;

    area.innerHTML = `
        <h3 class="estoque-secao-titulo">Cadastrar peça ou repor estoque</h3>

        <form id="formPecaIndividual" class="formulario-estoque">
            <label class="estoque-campo">
                Marca
                <select id="marcaPeca" required>
                    <option value="">Selecione uma marca</option>
                    ${opcoesMarcas()}
                </select>
            </label>

            ${campo("Modelo compatível", "modeloPeca")}
            ${campo("Nome da peça", "nomePeca")}
            ${campo("Quantidade", "quantidadePeca", "number")}
            ${campo("Custo unitário (R$)", "custoUnitarioPeca", "number")}
            ${campo("Fornecedor", "fornecedorPeca", "text", false)}
            ${campo("Observações", "observacaoPeca", "text", false)}

            <button type="submit">Salvar entrada</button>
        </form>
        <p>Se marca, modelo e peça já estiverem cadastrados, a quantidade será somada ao estoque.</p>
    `;

    $("formPecaIndividual").addEventListener("submit", salvarPecaIndividual);
}

async function salvarPecaIndividual(evento) {
    evento.preventDefault();

    const botao = evento.submitter;
    if (botao) botao.disabled = true;

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
            throw new Error(resultado.mensagem || "Não foi possível salvar.");
        }

        mostrarMensagem(resultado.mensagem || "Entrada registrada.");
        evento.target.reset();

        await atualizarTudo();
    } catch (erro) {
        mostrarMensagem(erro.message || "Erro ao salvar a peça.", true);
    } finally {
        if (botao) botao.disabled = false;
    }
}

function mostrarFormularioLote() {
    const area = $("formularioCadastro");
    if (!area) return;

    area.innerHTML = `
        <h3 class="estoque-secao-titulo">Cadastro em lote</h3>
        <p>Adicione quantas linhas precisar. Cada linha representa uma entrada de estoque.</p>

        <form id="formPecaLote">
            <div id="linhasLote"></div>

            <div class="estoque-acoes-cadastro">
                <button type="button" id="btnAdicionarLinha">
                    + Adicionar linha
                </button>
                <button type="submit" id="btnSalvarLote">
                    Salvar lote
                </button>
            </div>
        </form>
    `;

    adicionarLinhaLote();
    adicionarLinhaLote();

    $("btnAdicionarLinha").addEventListener("click", adicionarLinhaLote);
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
            <input class="lote-quantidade" type="number" min="1" step="1" required>
        </label>

        <label class="estoque-campo">
            Custo unitário (R$)
            <input class="lote-custo" type="number" min="0" step="0.01" required>
        </label>

        <label class="estoque-campo">
            Fornecedor
            <input class="lote-fornecedor">
        </label>

        <label class="estoque-campo">
            Observações
            <input class="lote-observacao">
        </label>

        <button type="button" class="btn-remover-linha">Remover linha</button>
    `;

    linha.querySelector(".btn-remover-linha").addEventListener("click", () => {
        if (area.children.length <= 1) {
            mostrarMensagem("Mantenha pelo menos uma linha no cadastro.", true);
            return;
        }

        linha.remove();
    });

    area.appendChild(linha);
}

async function salvarLote(evento) {
    evento.preventDefault();

    const botao = $("btnSalvarLote");
    botao.disabled = true;

    const itens = Array.from(document.querySelectorAll(".linha-lote"))
        .map(linha => ({
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
            itens
        });

        if (resultado.cadastrados > 0) {
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
            mostrarMensagem(resultado.mensagem || "Erro no lote.", true);
        } else {
            mostrarMensagem(resultado.mensagem || "Lote salvo.");
            mostrarFormularioLote();
        }
    } catch (erro) {
        mostrarMensagem(erro.message || "Erro ao salvar o lote.", true);
    } finally {
        botao.disabled = false;
    }
}


/* ---------- MARCAS ---------- */

async function gerenciarMarcasUI() {
    const nome = prompt(
        "Digite o nome da marca que deseja adicionar ou reativar:"
    );

    if (nome === null) return;

    if (!nome.trim()) {
        mostrarMensagem("Digite um nome de marca válido.", true);
        return;
    }

    try {
        const resultado = await postAPI({
            action: "gerenciarMarca",
            operacao: "adicionar",
            marca: nome.trim()
        });

        if (!resultado.sucesso) {
            throw new Error(resultado.mensagem || "Erro ao cadastrar marca.");
        }

        await carregarMarcas();

        if (modoCadastro === "lote") mostrarFormularioLote();
        else mostrarFormularioIndividual();

        mostrarMensagem(resultado.mensagem || "Marca salva.");
    } catch (erro) {
        mostrarMensagem(erro.message || "Erro ao cadastrar marca.", true);
    }
}

async function carregarMarcas() {
    const resultado = await getAPI("listarMarcas");

    if (resultado.sucesso === false) {
        throw new Error(resultado.mensagem || "Erro ao listar marcas.");
    }

    marcasCarregadas = resultado.marcas || [];
}


/* ---------- ESTOQUE ---------- */

async function carregarEstoque() {
    const lista = $("listaEstoque");
    if (!lista) return;

    lista.innerHTML = "<p>Carregando estoque...</p>";

    const resultado = await getAPI("listarEstoque");

    if (resultado.sucesso === false) {
        throw new Error(resultado.mensagem || "Erro ao carregar estoque.");
    }

    pecasCarregadas = resultado.itens || [];

    if ( $("totalPecas") ) {
        $("totalPecas").textContent = pecasCarregadas.length;
    }

    if ($("totalUnidades")) {
        $("totalUnidades").textContent = pecasCarregadas.reduce(
            (total, item) => total + Number(item.quantidade || 0), 0
        );
    }

    renderizarPecas(lista, pecasCarregadas, false);
}

function renderizarPecas(container, itens, pesquisa) {
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
            <h3>${escapar(item.peca)}</h3>
            <p><strong>Marca:</strong> ${escapar(item.marca)}</p>
            <p><strong>Modelo compatível:</strong> ${escapar(item.modelo)}</p>
            <p><strong>Quantidade disponível:</strong> ${Number(item.quantidade)}</p>
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

async function registrarEntradaUI(id) {
    const item = pecasCarregadas.find(p => String(p.id) === String(id));
    if (!item) return;

    const quantidade = prompt(`Quantidade de ${item.peca} que entrou:`);
    if (quantidade === null) return;

    const custoUnitario = prompt("Custo unitário pago nesta compra (R$):");
    if (custoUnitario === null) return;

    const fornecedor = prompt("Fornecedor (opcional):") || "";
    const observacao = prompt("Observações (opcional):") || "";

    try {
        const resultado = await postAPI({
            action: "registrarEntrada",
            pecaId: id,
            quantidade,
            custoUnitario,
            fornecedor,
            observacao
        });

        if (!resultado.sucesso) {
            throw new Error(resultado.mensagem || "Erro ao registrar entrada.");
        }

        mostrarMensagem(resultado.mensagem || "Entrada registrada.");
        await atualizarTudo();
    } catch (erro) {
        mostrarMensagem(erro.message || "Erro ao registrar entrada.", true);
    }
}

async function registrarSaidaUI(id) {
    const item = pecasCarregadas.find(p => String(p.id) === String(id));
    if (!item) return;

    const quantidade = prompt(
        `Quantidade de ${item.peca} que saiu. Disponível: ${item.quantidade}`
    );

    if (quantidade === null) return;

    const motivo = prompt(
        "Motivo da saída (ex.: venda, uso em assistência, perda):"
    ) || "";

    const observacao = prompt("Observações (opcional):") || "";

    try {
        const resultado = await postAPI({
            action: "registrarSaida",
            pecaId: id,
            quantidade,
            motivo,
            observacao
        });

        if (!resultado.sucesso) {
            throw new Error(resultado.mensagem || "Erro ao registrar saída.");
        }

        mostrarMensagem(resultado.mensagem || "Saída registrada.");
        await atualizarTudo();
    } catch (erro) {
        mostrarMensagem(erro.message || "Erro ao registrar saída.", true);
    }
}


/* ---------- PESQUISA ---------- */

function configurarPesquisa() {
    const campoPesquisa = $("pesquisaPeca");
    const resultado = $("resultadoPesquisa");

    if (!campoPesquisa || !resultado) return;

    campoPesquisa.addEventListener("input", () => {
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
    });
}


/* ---------- HISTÓRICO ---------- */

async function carregarHistorico() {
    const lista = $("listaHistorico");
    if (!lista) return;

    lista.innerHTML = "<p>Carregando histórico...</p>";

    const busca = $("filtroHistorico")?.value?.trim() || "";
    const resultado = await getAPI("listarHistorico", { busca });

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


/* ---------- ATUALIZAÇÃO GERAL ---------- */

async function atualizarTudo() {
    try {
        await Promise.all([
            carregarEstoque(),
            carregarHistorico()
        ]);

        const termo = $("pesquisaPeca")?.value?.trim() || "";
        if (termo) {
            $("pesquisaPeca").dispatchEvent(new Event("input"));
        }
    } catch (erro) {
        mostrarMensagem(erro.message || "Erro ao atualizar o estoque.", true);
    }
}

async function iniciarEstoque() {
    montarCadastro();
    configurarPesquisa();

    $("btnAtualizarEstoque")?.addEventListener("click", atualizarTudo);

    $("filtroHistorico")?.addEventListener("input", () => {
        carregarHistorico().catch(erro => {
            mostrarMensagem(erro.message || "Erro ao carregar histórico.", true);
        });
    });

    try {
        await carregarMarcas();
        mostrarFormularioIndividual();

        await atualizarTudo();
    } catch (erro) {
        mostrarMensagem(
            erro.message ||
            "Não foi possível conectar ao estoque. Confira a URL e a implantação do Apps Script.",
            true
        );
    }
}

document.addEventListener("DOMContentLoaded", iniciarEstoque);