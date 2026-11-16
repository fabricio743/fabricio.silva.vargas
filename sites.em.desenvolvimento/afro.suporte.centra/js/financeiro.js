
/* =========================================================
   FINANCEIRO
========================================================= */

let dadosFinanceiros = {
    trabalhos: [],
    pagamentos: [],
    custos: []
};

const moeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
});


/* =========================================================
   FUNÇÕES AUXILIARES
========================================================= */

function converterData(valor) {

    if (!valor) return null;

    const texto = String(valor);

    // Formato yyyy-MM-dd
    if (/^\d{4}-\d{2}-\d{2}/.test(texto)) {

        const partes = texto.substring(0, 10).split("-");

        return new Date(
            Number(partes[0]),
            Number(partes[1]) - 1,
            Number(partes[2])
        );
    }

    // Formato dd/MM/yyyy
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) {

        const partes = texto.split("/");

        return new Date(
            Number(partes[2]),
            Number(partes[1]) - 1,
            Number(partes[0])
        );
    }

    const data = new Date(valor);

    return isNaN(data.getTime()) ? null : data;
}


function obterMes(data) {

    if (!data) return "";

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");

    return `${ano}-${mes}`;
}


function formatarData(valor) {

    const data = converterData(valor);

    if (!data) return "-";

    return data.toLocaleDateString("pt-BR");
}


function formatarMoeda(valor) {

    return moeda.format(Number(valor) || 0);
}


function escaparHTML(valor) {

    return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[caractere]);
}


function obterNomeMes(mes) {

    const [ano, numeroMes] = mes.split("-").map(Number);

    const data = new Date(ano, numeroMes - 1, 1);

    return data.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric"
    });
}


/* =========================================================
   CARREGAR DADOS
========================================================= */

async function carregarFinanceiro() {

    try {

        const resposta = await apiGet("obterDadosDashboard");

        if (!resposta || !resposta.sucesso) {
            throw new Error("Não foi possível carregar os dados financeiros.");
        }

        dadosFinanceiros.trabalhos = resposta.trabalhos || [];
        dadosFinanceiros.pagamentos = resposta.pagamentos || [];
        dadosFinanceiros.custos = resposta.custos || [];

        prepararFiltros();

        atualizarFinanceiro();

    } catch (erro) {

        console.error("Erro ao carregar financeiro:", erro);

        document.getElementById("corpoRecebimentos").innerHTML =
            `<tr><td colspan="5">Erro ao carregar recebimentos.</td></tr>`;

        document.getElementById("corpoCustos").innerHTML =
            `<tr><td colspan="4">Erro ao carregar custos.</td></tr>`;

    }
}


/* =========================================================
   PREPARAR FILTROS
========================================================= */

function prepararFiltros() {

    const seletorPeriodo = document.getElementById("periodoFinanceiro");
    const seletorAno = document.getElementById("anoFinanceiro");

    const hoje = new Date();

    const mesAtual = obterMes(hoje);
    const anoAtual = String(hoje.getFullYear());

    const meses = new Set([mesAtual]);
    const anos = new Set([anoAtual]);

    dadosFinanceiros.pagamentos.forEach(pagamento => {

        const data = converterData(pagamento.data);

        if (data) {
            meses.add(obterMes(data));
            anos.add(String(data.getFullYear()));
        }
    });

    dadosFinanceiros.trabalhos.forEach(trabalho => {

        const data = converterData(trabalho.data);

        if (data) {
            meses.add(obterMes(data));
            anos.add(String(data.getFullYear()));
        }
    });

    const mesesOrdenados = [...meses].sort().reverse();

    seletorPeriodo.innerHTML = mesesOrdenados.map(mes => `
        <option value="${mes}">
            ${escaparHTML(obterNomeMes(mes))}
        </option>
    `).join("");

    seletorPeriodo.value = mesAtual;

    const anosOrdenados = [...anos].sort().reverse();

    seletorAno.innerHTML = anosOrdenados.map(ano => `
        <option value="${ano}">${ano}</option>
    `).join("");

    seletorAno.value = anoAtual;

    seletorPeriodo.addEventListener("change", atualizarFinanceiro);

    seletorAno.addEventListener("change", atualizarComparativo);
}


/* =========================================================
   ATUALIZAR PÁGINA
========================================================= */

function atualizarFinanceiro() {

    const periodo = document.getElementById("periodoFinanceiro").value;

    const trabalhosDoPeriodo = dadosFinanceiros.trabalhos.filter(trabalho => {

        return obterMes(converterData(trabalho.data)) === periodo;
    });

    const pagamentosDoPeriodo = dadosFinanceiros.pagamentos.filter(pagamento => {

        return obterMes(converterData(pagamento.data)) === periodo;
    });

    const idsTrabalhos = new Set(
        trabalhosDoPeriodo.map(trabalho => String(trabalho.id))
    );

    const custosDoPeriodo = dadosFinanceiros.custos.filter(custo => {

        return idsTrabalhos.has(String(custo.idTrabalho));
    });

    const totalRecebido = pagamentosDoPeriodo.reduce(
        (total, pagamento) => total + (Number(pagamento.valor) || 0),
        0
    );

    const totalCustos = custosDoPeriodo.reduce(
        (total, custo) => total + (Number(custo.valor) || 0),
        0
    );

    // Pendências de todos os trabalhos não cancelados.
    const totalPendente = dadosFinanceiros.trabalhos.reduce((total, trabalho) => {

        if (String(trabalho.status).toLowerCase() === "cancelado") {
            return total;
        }

        return total + (Number(trabalho.pendente) || 0);

    }, 0);

    const resultado = totalRecebido - totalCustos;

    document.getElementById("financeiroRecebido").textContent =
        formatarMoeda(totalRecebido);

    document.getElementById("financeiroCustos").textContent =
        formatarMoeda(totalCustos);

    document.getElementById("financeiroResultado").textContent =
        formatarMoeda(resultado);

    document.getElementById("financeiroPendente").textContent =
        formatarMoeda(totalPendente);

    renderizarRecebimentos(pagamentosDoPeriodo);
    renderizarCustos(custosDoPeriodo);

    atualizarComparativo();
}


/* =========================================================
   TABELA DE RECEBIMENTOS
========================================================= */

function renderizarRecebimentos(pagamentos) {

    const corpo = document.getElementById("corpoRecebimentos");

    const trabalhos = new Map(
        dadosFinanceiros.trabalhos.map(trabalho => [
            String(trabalho.id),
            trabalho
        ])
    );

    const ordenados = [...pagamentos].sort((a, b) => {

        return (converterData(b.data) || 0) - (converterData(a.data) || 0);
    });

    document.getElementById("quantidadeRecebimentos").textContent =
        ordenados.length;

    if (ordenados.length === 0) {

        corpo.innerHTML = `
            <tr>
                <td colspan="5">Nenhum recebimento neste período.</td>
            </tr>
        `;

        return;
    }

    corpo.innerHTML = ordenados.map(pagamento => {

        const trabalho = trabalhos.get(String(pagamento.idTrabalho));

        return `
            <tr>
                <td>${formatarData(pagamento.data)}</td>
                <td>${escaparHTML(trabalho?.cliente || "-")}</td>
                <td>${escaparHTML(trabalho?.servico || "-")}</td>
                <td>${escaparHTML(pagamento.forma || "-")}</td>
                <td>${formatarMoeda(pagamento.valor)}</td>
            </tr>
        `;

    }).join("");
}


/* =========================================================
   TABELA DE CUSTOS
========================================================= */

function renderizarCustos(custos) {

    const corpo = document.getElementById("corpoCustos");

    const trabalhos = new Map(
        dadosFinanceiros.trabalhos.map(trabalho => [
            String(trabalho.id),
            trabalho
        ])
    );

    const ordenados = [...custos].sort((a, b) => {

        const trabalhoA = trabalhos.get(String(a.idTrabalho));
        const trabalhoB = trabalhos.get(String(b.idTrabalho));

        return (converterData(trabalhoB?.data) || 0) -
               (converterData(trabalhoA?.data) || 0);
    });

    document.getElementById("quantidadeCustos").textContent =
        ordenados.length;

    if (ordenados.length === 0) {

        corpo.innerHTML = `
            <tr>
                <td colspan="4">Nenhum custo neste período.</td>
            </tr>
        `;

        return;
    }

    corpo.innerHTML = ordenados.map(custo => {

        const trabalho = trabalhos.get(String(custo.idTrabalho));

        return `
            <tr>
                <td>${escaparHTML(trabalho?.servico || "-")}</td>
                <td>${escaparHTML(trabalho?.cliente || "-")}</td>
                <td>${escaparHTML(custo.descricao || "-")}</td>
                <td>${formatarMoeda(custo.valor)}</td>
            </tr>
        `;

    }).join("");
}


/* =========================================================
   COMPARATIVO MENSAL
========================================================= */

function atualizarComparativo() {

    const ano = Number(document.getElementById("anoFinanceiro").value);

    const corpo = document.getElementById("corpoComparativoFinanceiro");

    if (!ano || !corpo) return;

    const linhas = [];

    for (let mes = 0; mes < 12; mes++) {

        const chaveMes = `${ano}-${String(mes + 1).padStart(2, "0")}`;

        const recebimentos = dadosFinanceiros.pagamentos
            .filter(pagamento => {
                return obterMes(converterData(pagamento.data)) === chaveMes;
            })
            .reduce((total, pagamento) => {
                return total + (Number(pagamento.valor) || 0);
            }, 0);

        const trabalhosDoMes = new Set(
            dadosFinanceiros.trabalhos
                .filter(trabalho => {
                    return obterMes(converterData(trabalho.data)) === chaveMes;
                })
                .map(trabalho => String(trabalho.id))
        );

        const custos = dadosFinanceiros.custos
            .filter(custo => {
                return trabalhosDoMes.has(String(custo.idTrabalho));
            })
            .reduce((total, custo) => {
                return total + (Number(custo.valor) || 0);
            }, 0);

        const resultado = recebimentos - custos;

        const nomeMes = new Date(ano, mes, 1).toLocaleDateString("pt-BR", {
            month: "long"
        });

        linhas.push(`
            <tr>
                <td>${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}</td>
                <td>${formatarMoeda(recebimentos)}</td>
                <td>${formatarMoeda(custos)}</td>
                <td>${formatarMoeda(resultado)}</td>
            </tr>
        `);
    }

    corpo.innerHTML = linhas.join("");
}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    carregarFinanceiro();

});
