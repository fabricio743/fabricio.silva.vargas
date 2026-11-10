
/* =========================================================
   GESTÃO DE TRABALHOS
   Cadastro e cálculos financeiros
========================================================= */

const CHAVE_TRABALHOS = "gestaoTrabalhos";

const $ = id => document.getElementById(id);


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

    const totalRecebido = pagamentos.reduce(
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

    const trabalho = {

        cliente: $("cliente").value.trim(),
        telefone: $("telefone").value.trim(),
        categoria: $("categoria").value,
        servico: $("servico").value.trim(),
        data: $("data").value,
        status: $("status").value,

        valorServico: resumo.valorServico,

        custos: coletarCustos(),

        pagamentos: coletarPagamentos(),

        observacoes: $("observacoes").value.trim()

    };

    const textoOriginal = botaoSalvar.textContent;

    try {

        botaoSalvar.disabled = true;
        botaoSalvar.textContent = "Salvando...";

        mostrarMensagem("Enviando trabalho para o servidor...");

        const resposta = await apiPost(
            "salvarTrabalho",
            trabalho
        );

        if (!resposta || !resposta.sucesso) {

            throw new Error(
                resposta?.mensagem ||
                "Não foi possível salvar o trabalho."
            );

        }

        mostrarMensagem(
            "Trabalho salvo com sucesso no Google Sheets!"
        );

        formulario.reset();

        restaurarCamposIniciais();

        atualizarResumo();

    } catch (erro) {

        console.error("Erro ao salvar trabalho:", erro);

        mostrarMensagem(
            erro.message ||
            "Erro ao salvar. Tente novamente.",
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

document.addEventListener("DOMContentLoaded", () => {
    configurarCustos();
    configurarPagamentos();
    configurarCalculos();

    $("formTrabalho").addEventListener(
        "submit",
        salvarTrabalho
    );

    $("data").value = dataAtual();

    atualizarResumo();
});
