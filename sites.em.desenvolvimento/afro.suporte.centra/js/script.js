
/* =========================================================
   GESTÃO DE TRABALHOS
   Cadastro e cálculos financeiros
========================================================= */

const CHAVE_TRABALHOS = "gestaoTrabalhos";

const $ = id => document.getElementById(id);

const parametrosURL = new URLSearchParams(window.location.search);
const ID_TRABALHO_EDICAO = parametrosURL.get("id");

let trabalhoEmEdicao = null;
let totalPagamentosAnteriores = 0;


/* =========================================================
   FUNÇÕES AUXILIARES
========================================================= */

function dinheiro(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


function valorNumerico(valor) {
    return Number.parseFloat(valor) || 0;
}


function dataAtual() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function dataParaCampo(valor) {
    if (!valor) return "";

    const texto = String(valor);

    if (/^\d{4}-\d{2}-\d{2}/.test(texto)) {
        return texto.substring(0, 10);
    }

    return "";
}


function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caractere]);
}


function formatarDataHistorico(valor) {
    const data = dataParaCampo(valor);

    if (!data) return "—";

    const [ano, mes, dia] = data.split("-");

    return `${dia}/${mes}/${ano}`;
}


function obterTrabalhos() {
    try {
        return JSON.parse(
            localStorage.getItem(CHAVE_TRABALHOS)
        ) || [];
    } catch {
        return [];
    }
}


function mostrarMensagem(mensagem, erro = false) {
    let aviso = $("mensagemFormulario");

    if (!aviso) {
        aviso = document.createElement("div");
        aviso.id = "mensagemFormulario";
        $("formTrabalho").prepend(aviso);
    }

    aviso.textContent = mensagem;

    aviso.style.cssText = `
        padding: 14px;
        margin-bottom: 20px;
        border-radius: 8px;
        background: ${erro ? "#482027" : "#173b30"};
        color: ${erro ? "#ff9da5" : "#7de0b4"};
        border: 1px solid ${erro ? "#a94350" : "#287b5c"};
    `;

    aviso.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}


/* =========================================================
   ADICIONAR E REMOVER CUSTOS
========================================================= */

function criarCampoCusto() {
    const linha = document.createElement("div");

    linha.className = "cost-row";

    linha.innerHTML = `
        <div class="form-group">
            <label>Descrição do custo</label>

            <input
                type="text"
                name="descricaoCusto"
                placeholder="Ex: Tela, bateria, material..."
            >
        </div>

        <div class="form-group cost-value">
            <label>Valor (R$)</label>

            <input
                type="number"
                name="valorCusto"
                min="0"
                step="0.01"
                placeholder="0,00"
            >
        </div>

        <button
            type="button"
            class="btn-remove"
            aria-label="Remover custo"
        >
            ×
        </button>
    `;

    $("listaCustos").appendChild(linha);
}


function configurarCustos() {
    $("adicionarCusto").addEventListener("click", () => {
        criarCampoCusto();
    });

    $("listaCustos").addEventListener("click", evento => {
        const botao = evento.target.closest(".btn-remove");

        if (!botao) return;

        const linhas = $("listaCustos").querySelectorAll(".cost-row");

        if (linhas.length > 1) {
            botao.closest(".cost-row").remove();
        } else {
            const linha = botao.closest(".cost-row");
            linha.querySelectorAll("input").forEach(campo => {
                campo.value = "";
            });
        }

        atualizarResumo();
    });
}


/* =========================================================
   ADICIONAR E REMOVER PAGAMENTOS
========================================================= */

function criarCampoPagamento() {
    const linha = document.createElement("div");

    linha.className = "payment-row";

    linha.innerHTML = `
        <div class="form-group">
            <label>Data do recebimento</label>

            <input
                type="date"
                name="dataPagamento"
            >
        </div>

        <div class="form-group">
            <label>Valor recebido (R$)</label>

            <input
                type="number"
                name="valorPagamento"
                min="0"
                step="0.01"
                placeholder="0,00"
            >
        </div>

        <div class="form-group">
            <label>Forma de pagamento</label>

            <select name="formaPagamento">
                <option value="">Selecione</option>
                <option>Dinheiro</option>
                <option>Pix</option>
                <option>Cartão de débito</option>
                <option>Cartão de crédito</option>
                <option>Transferência bancária</option>
                <option>Outros</option>
            </select>
        </div>

        <button
            type="button"
            class="btn-remove"
            aria-label="Remover pagamento"
        >
            ×
        </button>
    `;

    $("listaPagamentos").appendChild(linha);
}


function configurarPagamentos() {
    $("adicionarPagamento").addEventListener("click", () => {
        criarCampoPagamento();
    });

    $("listaPagamentos").addEventListener("click", evento => {
        const botao = evento.target.closest(".btn-remove");

        if (!botao) return;

        const linhas = $("listaPagamentos")
            .querySelectorAll(".payment-row");

        if (linhas.length > 1) {
            botao.closest(".payment-row").remove();
        } else {
            const linha = botao.closest(".payment-row");

            linha.querySelectorAll("input").forEach(campo => {
                campo.value = "";
            });

            linha.querySelector("select").value = "";
        }

        atualizarResumo();
    });
}


/* =========================================================
   COLETAR CUSTOS
========================================================= */

function coletarCustos() {
    const linhas = document.querySelectorAll(".cost-row");

    return Array.from(linhas).map(linha => ({
        descricao: linha.querySelector(
            '[name="descricaoCusto"]'
        ).value.trim(),

        valor: valorNumerico(
            linha.querySelector('[name="valorCusto"]').value
        )
    })).filter(item => item.descricao || item.valor > 0);
}


/* =========================================================
   COLETAR PAGAMENTOS
========================================================= */

function coletarPagamentos() {
    const linhas = document.querySelectorAll(".payment-row");

    return Array.from(linhas).map(linha => ({
        data: linha.querySelector(
            '[name="dataPagamento"]'
        ).value,

        valor: valorNumerico(
            linha.querySelector('[name="valorPagamento"]').value
        ),

        forma: linha.querySelector(
            '[name="formaPagamento"]'
        ).value
    })).filter(item =>
        item.data || item.valor > 0 || item.forma
    );
}

function renderizarHistoricoPagamentos(pagamentos = []) {
    const container = $("historicoPagamentos");

    if (!container) return;

    totalPagamentosAnteriores = pagamentos.reduce(
        (total, pagamento) => total + valorNumerico(pagamento.valor),
        0
    );

    if (!pagamentos.length) {
        container.hidden = true;
        container.innerHTML = "";
        return;
    }

    container.hidden = false;

    container.innerHTML = `
        <div class="historico-pagamentos">
            <h3>Histórico de recebimentos</h3>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Valor</th>
                            <th>Forma</th>
                            <th>Observação</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${pagamentos.map(pagamento => `
                            <tr>
                                <td>${formatarDataHistorico(pagamento.data)}</td>
                                <td>${dinheiro(pagamento.valor)}</td>
                                <td>${escaparHTML(pagamento.forma || "—")}</td>
                                <td>${escaparHTML(pagamento.observacao || "—")}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>

            <p>
                Total recebido anteriormente:
                <strong>${dinheiro(totalPagamentosAnteriores)}</strong>
            </p>
        </div>
    `;
}

/* =========================================================
   CÁLCULOS FINANCEIROS
========================================================= */

function atualizarResumo() {
    const valorServico = valorNumerico(
        $("valorServico").value
    );

    const custos = coletarCustos();

    const pagamentos = coletarPagamentos();

    const totalCustos = custos.reduce(
        (total, item) => total + item.valor,
        0
    );

    const totalRecebido = totalPagamentosAnteriores +
    pagamentos.reduce(
        (total, item) => total + item.valor,
        0
    );

    const pendente = Math.max(
        valorServico - totalRecebido,
        0
    );

    const lucro = valorServico - totalCustos;

    $("resumoValor").textContent = dinheiro(valorServico);

    $("resumoCustos").textContent = dinheiro(totalCustos);

    $("resumoRecebido").textContent = dinheiro(totalRecebido);

    $("resumoPendente").textContent = dinheiro(pendente);

    $("resumoLucro").textContent = dinheiro(lucro);

    const campoLucro = $("resumoLucro");

    campoLucro.style.color = lucro < 0
        ? "#e45d66"
        : "#29b77a";

    return {
        valorServico,
        totalCustos,
        totalRecebido,
        pendente,
        lucro
    };
}


/* =========================================================
   VALIDAÇÃO DOS CUSTOS E PAGAMENTOS
========================================================= */

function validarLancamentos() {
    const custos = coletarCustos();
    const pagamentos = coletarPagamentos();

    for (const custo of custos) {
        if (!custo.descricao || custo.valor <= 0) {
            return "Preencha a descrição e o valor de todos os custos.";
        }
    }

    for (const pagamento of pagamentos) {
        if (
            !pagamento.data ||
            pagamento.valor <= 0 ||
            !pagamento.forma
        ) {
            return "Preencha a data, o valor e a forma de todos os pagamentos.";
        }
    }

    const resumo = atualizarResumo();

    if (resumo.totalRecebido > resumo.valorServico) {
        return "O total recebido não pode ser maior que o valor do serviço.";
    }

    return null;
}


/* =========================================================
   SALVAR TRABALHO TEMPORARIAMENTE
========================================================= */

async function carregarTrabalhoParaEdicao() {
    if (!ID_TRABALHO_EDICAO) return;

    try {
        mostrarMensagem("Carregando os dados do trabalho...");

        const resposta = await apiGet("obterTrabalho", {
            id: ID_TRABALHO_EDICAO
        });

        if (!resposta || !resposta.sucesso || !resposta.trabalho) {
            throw new Error(
                resposta?.mensagem || "Não foi possível carregar o trabalho."
            );
        }

        const trabalho = resposta.trabalho;

        trabalhoEmEdicao = trabalho;

        $("cliente").value = trabalho.cliente || "";
        $("telefone").value = trabalho.telefone || "";
        $("categoria").value = trabalho.categoria || "";
        $("servico").value = trabalho.servico || "";
        $("data").value = dataParaCampo(trabalho.data);
        $("status").value = trabalho.status || "";
        $("valorServico").value = valorNumerico(trabalho.valorServico);
        $("observacoes").value = trabalho.observacoes || "";

        // Preencher os custos existentes
        $("listaCustos").innerHTML = "";

        if (trabalho.custos && trabalho.custos.length) {
            trabalho.custos.forEach(custo => {
                criarCampoCusto();

                const linha = $("listaCustos").lastElementChild;

                linha.querySelector('[name="descricaoCusto"]').value =
                    custo.descricao || "";

                linha.querySelector('[name="valorCusto"]').value =
                    valorNumerico(custo.valor);
            });
        } else {
            criarCampoCusto();
        }

        // Mostrar pagamentos anteriores sem colocá-los
        // nos campos de novos pagamentos
        renderizarHistoricoPagamentos(trabalho.pagamentos || []);

        // Atualizar títulos e botão
        if ($("tituloPagina")) {
            $("tituloPagina").textContent = "Editar trabalho";
        }

        if ($("descricaoPagina")) {
            $("descricaoPagina").textContent =
                "Atualize os dados e acompanhe os recebimentos.";
        }

        const botaoSalvar = $("formTrabalho").querySelector(
            '[type="submit"]'
        );

        botaoSalvar.textContent = "Salvar alterações";

        if ($("tituloPagamentos")) {
            $("tituloPagamentos").textContent = "Adicionar recebimento";
        }

        if ($("descricaoPagamentos")) {
            $("descricaoPagamentos").textContent =
                "Os recebimentos anteriores ficam preservados no histórico.";
        }

        atualizarResumo();

        const aviso = $("mensagemFormulario");
        if (aviso) aviso.remove();

    } catch (erro) {
        console.error("Erro ao carregar trabalho:", erro);

        mostrarMensagem(
            erro.message || "Erro ao carregar os dados do trabalho.",
            true
        );
    }
}

/* =====================================================
   SALVAR TRABALHO NO GOOGLE SHEETS
===================================================== */

async function salvarTrabalho(evento) {
    evento.preventDefault();

    const formulario = $("formTrabalho");

    const botaoSalvar = formulario.querySelector(
        '[type="submit"]'
    );

    if (!formulario.reportValidity()) {
        return;
    }

    const erro = validarLancamentos();

    if (erro) {
        mostrarMensagem(erro, true);
        return;
    }

    const resumo = atualizarResumo();

    const editando = Boolean(ID_TRABALHO_EDICAO);

    const trabalho = {
        cliente: $("cliente").value.trim(),
        telefone: $("telefone").value.trim(),
        categoria: $("categoria").value,
        servico: $("servico").value.trim(),
        data: $("data").value,
        status: $("status").value,

        valorServico: resumo.valorServico,

        custos: coletarCustos(),

        observacoes: $("observacoes").value.trim()
    };

    if (editando) {
        trabalho.id = ID_TRABALHO_EDICAO;

        // Envia somente os novos recebimentos.
        // Os pagamentos antigos permanecem no histórico.
        trabalho.novosPagamentos = coletarPagamentos();

    } else {
        trabalho.pagamentos = coletarPagamentos();
    }

    const textoOriginal = botaoSalvar.textContent;

    try {
        botaoSalvar.disabled = true;
        botaoSalvar.textContent = editando
            ? "Salvando alterações..."
            : "Salvando...";

        mostrarMensagem(
            editando
                ? "Atualizando trabalho no servidor..."
                : "Enviando trabalho para o servidor..."
        );

        const resposta = await apiPost(
            editando ? "editarTrabalho" : "salvarTrabalho",
            trabalho
        );

        if (!resposta || !resposta.sucesso) {
            throw new Error(
                resposta?.mensagem ||
                "Não foi possível salvar o trabalho."
            );
        }

        if (editando) {
            mostrarMensagem(
                "Trabalho atualizado com sucesso! Redirecionando..."
            );

            setTimeout(() => {
                window.location.href =
                    `detalhes.html?id=${encodeURIComponent(ID_TRABALHO_EDICAO)}`;
            }, 1200);

        } else {
            mostrarMensagem(
                "Trabalho salvo com sucesso no Google Sheets!"
            );

            formulario.reset();

            totalPagamentosAnteriores = 0;

            restaurarCamposIniciais();

            atualizarResumo();
        }

    } catch (erro) {
        console.error("Erro ao salvar trabalho:", erro);

        mostrarMensagem(
            erro.message || "Erro ao salvar. Tente novamente.",
            true
        );

    } finally {
        botaoSalvar.disabled = false;
        botaoSalvar.textContent = textoOriginal;
    }
}



/* =========================================================
   RESTAURAR CAMPOS INICIAIS
========================================================= */

function restaurarCamposIniciais() {
    $("data").value = dataAtual();

    $("listaCustos").innerHTML = `
        <div class="cost-row">
            <div class="form-group">
                <label>Descrição do custo</label>
                <input
                    type="text"
                    name="descricaoCusto"
                    placeholder="Ex: Tela, bateria, material..."
                >
            </div>

            <div class="form-group cost-value">
                <label>Valor (R$)</label>
                <input
                    type="number"
                    name="valorCusto"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                >
            </div>
        </div>
    `;

    $("listaPagamentos").innerHTML = `
        <div class="payment-row">
            <div class="form-group">
                <label>Data do recebimento</label>
                <input type="date" name="dataPagamento">
            </div>

            <div class="form-group">
                <label>Valor recebido (R$)</label>
                <input
                    type="number"
                    name="valorPagamento"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                >
            </div>

            <div class="form-group">
                <label>Forma de pagamento</label>
                <select name="formaPagamento">
                    <option value="">Selecione</option>
                    <option>Dinheiro</option>
                    <option>Pix</option>
                    <option>Cartão de débito</option>
                    <option>Cartão de crédito</option>
                    <option>Transferência bancária</option>
                    <option>Outros</option>
                </select>
            </div>
        </div>
    `;
}


/* =========================================================
   EVENTOS DOS CÁLCULOS
========================================================= */

function configurarCalculos() {
    $("formTrabalho").addEventListener("input", atualizarResumo);

    $("formTrabalho").addEventListener("change", atualizarResumo);
}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    configurarCustos();
    configurarPagamentos();
    configurarCalculos();

    $("formTrabalho").addEventListener(
        "submit",
        salvarTrabalho
    );

    $("data").value = dataAtual();

    atualizarResumo();

    if (ID_TRABALHO_EDICAO) {
        await carregarTrabalhoParaEdicao();
    }
});