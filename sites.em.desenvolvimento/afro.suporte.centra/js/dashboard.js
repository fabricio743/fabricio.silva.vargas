/* =====================================================
   DASHBOARD - GESTÃO DE TRABALHOS
===================================================== */

const $ = id => document.getElementById(id);


let dadosDashboard = {

    trabalhos: [],

    pagamentos: []

};


const MESES = [

    "Janeiro", "Fevereiro", "Março",

    "Abril", "Maio", "Junho",

    "Julho", "Agosto", "Setembro",

    "Outubro", "Novembro", "Dezembro"

];


/* =====================================================
   FORMATAÇÃO
===================================================== */

function formatarDinheiro(valor) {

    return Number(valor || 0).toLocaleString("pt-BR", {

        style: "currency",

        currency: "BRL"

    });

}


function escaparHTML(valor) {

    return String(valor ?? "").replace(/[&<>"']/g, caractere => {

        const mapa = {

            "&": "&amp;",

            "<": "&lt;",

            ">": "&gt;",

            '"': "&quot;",

            "'": "&#039;"

        };

        return mapa[caractere];

    });

}


/* =====================================================
   DATAS
===================================================== */

function interpretarData(valor) {

    if (!valor) return null;


    if (valor instanceof Date) {

        return isNaN(valor.getTime()) ? null : valor;

    }


    const texto = String(valor).trim();


    const iso = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);


    if (iso) {

        return new Date(

            Number(iso[1]),

            Number(iso[2]) - 1,

            Number(iso[3])

        );

    }


    const brasileiro = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})/);


    if (brasileiro) {

        return new Date(

            Number(brasileiro[3]),

            Number(brasileiro[2]) - 1,

            Number(brasileiro[1])

        );

    }


    const data = new Date(texto);


    return isNaN(data.getTime()) ? null : data;

}


function chaveMes(data) {

    if (!data) return "";


    return `${data.getFullYear()}-${String(

        data.getMonth() + 1

    ).padStart(2, "0")}`;

}


function formatarData(valor) {

    const data = interpretarData(valor);

    if (!data) return "—";

    return data.toLocaleDateString("pt-BR");

}


/* =====================================================
   SELETORES DE PERÍODO
===================================================== */

function configurarPeriodos() {

    const seletorPeriodo = $("periodoDashboard");

    const seletorAno = $("anoComparativo");

    if (!seletorPeriodo || !seletorAno) return;


    const hoje = new Date();

    const periodoAtual = chaveMes(hoje);

    const periodos = new Set();


    // Últimos 24 meses.

    for (let i = 0; i < 24; i++) {

        const data = new Date(

            hoje.getFullYear(),

            hoje.getMonth() - i,

            1

        );

        periodos.add(chaveMes(data));

    }


    // Inclui períodos antigos com registros.

    dadosDashboard.trabalhos.forEach(trabalho => {

        const data = interpretarData(trabalho.data);

        if (data) periodos.add(chaveMes(data));

    });


    dadosDashboard.pagamentos.forEach(pagamento => {

        const data = interpretarData(pagamento.data);

        if (data) periodos.add(chaveMes(data));

    });


    seletorPeriodo.innerHTML = "";


    [...periodos].sort().reverse().forEach(periodo => {

        const [ano, mes] = periodo.split("-").map(Number);

        const opcao = document.createElement("option");

        opcao.value = periodo;

        opcao.textContent = `${MESES[mes - 1]} de ${ano}`;

        seletorPeriodo.appendChild(opcao);

    });


    seletorPeriodo.value = periodoAtual;


    atualizarAnosComparativo();


    seletorPeriodo.onchange = () => {

        atualizarAnosComparativo();

        atualizarDashboard();

    };


    seletorAno.onchange = () => {

        const mes = seletorPeriodo.value.split("-")[1];

        const periodo = `${seletorAno.value}-${mes}`;


        const existe = Array.from(seletorPeriodo.options)

            .some(opcao => opcao.value === periodo);


        if (!existe) {

            const opcao = document.createElement("option");

            opcao.value = periodo;

            opcao.textContent =

                `${MESES[Number(mes) - 1]} de ${seletorAno.value}`;

            seletorPeriodo.appendChild(opcao);

        }


        seletorPeriodo.value = periodo;

        atualizarDashboard();

    };

}


/* =====================================================
   ANOS DO COMPARATIVO
===================================================== */

function atualizarAnosComparativo() {

    const seletorAno = $("anoComparativo");

    const seletorPeriodo = $("periodoDashboard");


    if (!seletorAno || !seletorPeriodo) return;


    const anoSelecionado =
        seletorPeriodo.value.split("-")[0];


    const anos = new Set();

    const anoAtual = new Date().getFullYear();


    for (let ano = anoAtual; ano >= anoAtual - 5; ano--) {

        anos.add(String(ano));

    }


    dadosDashboard.trabalhos.forEach(trabalho => {

        const data = interpretarData(trabalho.data);

        if (data) anos.add(String(data.getFullYear()));

    });


    dadosDashboard.pagamentos.forEach(pagamento => {

        const data = interpretarData(pagamento.data);

        if (data) anos.add(String(data.getFullYear()));

    });


    if (anoSelecionado) {

        anos.add(anoSelecionado);

    }


    const anosOrdenados = [...anos].sort(

        (a, b) => Number(b) - Number(a)

    );


    seletorAno.innerHTML = anosOrdenados.map(ano => {

        return `<option value="${ano}">${ano}</option>`;

    }).join("");


    seletorAno.value = anoSelecionado;

}


/* =====================================================
   CÁLCULOS MENSAIS
===================================================== */

function calcularMes(periodo) {

    const trabalhosDoMes = dadosDashboard.trabalhos.filter(trabalho => {

        return chaveMes(
            interpretarData(trabalho.data)
        ) === periodo;

    });


    const idsTrabalhos = new Set(

        trabalhosDoMes.map(trabalho => String(trabalho.id))

    );


    const faturamento = trabalhosDoMes.reduce(

        (total, trabalho) =>

            total + Number(trabalho.valorServico || 0),

        0

    );


    const custos = trabalhosDoMes.reduce(

        (total, trabalho) =>

            total + Number(trabalho.totalCustos || 0),

        0

    );


    const recebimentos = dadosDashboard.pagamentos

        .filter(pagamento => {

            return chaveMes(

                interpretarData(pagamento.data)

            ) === periodo;

        })

        .reduce(

            (total, pagamento) =>

                total + Number(pagamento.valor || 0),

            0

        );


    return {

        faturamento,

        recebimentos,

        custos,

        lucro: faturamento - custos,

        quantidade: trabalhosDoMes.length,

        trabalhos: trabalhosDoMes,

        idsTrabalhos

    };

}


/* =====================================================
   CALCULAR TOTAL A RECEBER
===================================================== */

function calcularTotalPendente() {

    return dadosDashboard.trabalhos

        .filter(trabalho => {

            const status = String(trabalho.status || "")

                .trim()

                .toLowerCase();


            const pendente = Number(trabalho.pendente) || 0;


            return status !== "cancelado" && pendente > 0;

        })

        .reduce((total, trabalho) => {

            return total + (Number(trabalho.pendente) || 0);

        }, 0);

}


/* =====================================================
   RESUMO FINANCEIRO
===================================================== */

function atualizarResumoFinanceiro() {

    const periodo = $("periodoDashboard").value;

    const resumo = calcularMes(periodo);


    $("totalFaturamento").textContent =

        formatarDinheiro(resumo.faturamento);


    $("totalRecebido").textContent =

        formatarDinheiro(resumo.recebimentos);


    $("totalCustos").textContent =

        formatarDinheiro(resumo.custos);


    $("totalLucro").textContent =

        formatarDinheiro(resumo.lucro);


    // Saldo acumulado de todos os meses.

    $("totalAReceber").textContent =

        formatarDinheiro(calcularTotalPendente());

}


/* =====================================================
   COMPARATIVO MENSAL
===================================================== */

function atualizarComparativo() {

    const periodo = $("periodoDashboard").value;

    const [ano, mes] = periodo.split("-").map(Number);


    const dataAtual = new Date(ano, mes - 1, 1);

    const dataAnterior = new Date(ano, mes - 2, 1);


    const periodoAtual = chaveMes(dataAtual);

    const periodoAnterior = chaveMes(dataAnterior);


    const atual = calcularMes(periodoAtual);

    const anterior = calcularMes(periodoAnterior);


    const tabela = $("corpoComparativo");


    const cabecalhos = document.querySelectorAll(

        ".comparison-panel thead th"

    );


    if (cabecalhos.length >= 4) {

        cabecalhos[1].textContent =

            MESES[dataAnterior.getMonth()];

        cabecalhos[2].textContent =

            MESES[dataAtual.getMonth()];

    }


    const indicadores = [

        {

            nome: "Faturamento",

            anterior: anterior.faturamento,

            atual: atual.faturamento,

            dinheiro: true

        },

        {

            nome: "Recebimentos",

            anterior: anterior.recebimentos,

            atual: atual.recebimentos,

            dinheiro: true

        },

        {

            nome: "Custos",

            anterior: anterior.custos,

            atual: atual.custos,

            dinheiro: true

        },

        {

            nome: "Lucro",

            anterior: anterior.lucro,

            atual: atual.lucro,

            dinheiro: true

        },

        {

            nome: "Trabalhos",

            anterior: anterior.quantidade,

            atual: atual.quantidade,

            dinheiro: false

        }

    ];


    tabela.innerHTML = indicadores.map(item => {

        let variacao = "—";

        let classe = "neutral";


        if (item.anterior !== 0) {

            const percentual =

                ((item.atual - item.anterior) /

                    Math.abs(item.anterior)) * 100;


            variacao =

                `${percentual > 0 ? "+" : ""}${percentual.toFixed(1)}%`;


            if (percentual > 0) classe = "positive";

            if (percentual < 0) classe = "negative";


        } else if (item.atual !== 0) {

            variacao = "Novo";

            classe = "positive";

        }


        const valorAnterior = item.dinheiro

            ? formatarDinheiro(item.anterior)

            : item.anterior;


        const valorAtual = item.dinheiro

            ? formatarDinheiro(item.atual)

            : item.atual;


        return `

            <tr class="${item.nome === "Lucro" ? "profit-row" : ""}">

                <td>${item.nome}</td>

                <td>${valorAnterior}</td>

                <td>${valorAtual}</td>

                <td class="${classe}">
                    ${variacao}
                </td>

            </tr>

        `;

    }).join("");

}


/* =====================================================
   SITUAÇÃO DOS TRABALHOS
===================================================== */

function atualizarSituacaoTrabalhos() {

    const trabalhos = dadosDashboard.trabalhos;


    const normalizar = texto => String(texto || "")

        .trim()

        .toLowerCase()

        .normalize("NFD")

        .replace(/[\u0300-\u036f]/g, "");


    const contar = status => {

        return trabalhos.filter(trabalho => {

            return normalizar(trabalho.status) ===

                normalizar(status);

        }).length;

    };


    $("qtdEmAndamento").textContent =

        contar("Em andamento");


    $("qtdAguardandoAprovacao").textContent =

        contar("Aguardando aprovação");


    $("qtdAguardandoPeca").textContent =

        contar("Aguardando peça");


    const concluidos = trabalhos.filter(trabalho => {

        const status = normalizar(trabalho.status);

        return status === "concluido" ||

               status === "entregue";

    }).length;


    $("qtdConcluidos").textContent = concluidos;


    $("totalPendente").textContent =

        formatarDinheiro(calcularTotalPendente());

}


/* =====================================================
   TRABALHOS RECENTES
===================================================== */

function atualizarTrabalhosRecentes() {

    const tabela = $("corpoTrabalhosRecentes");


    const recentes = [...dadosDashboard.trabalhos]

        .sort((a, b) => {

            const dataA = interpretarData(a.data);

            const dataB = interpretarData(b.data);


            return (dataB?.getTime() || 0) -

                   (dataA?.getTime() || 0);

        })

        .slice(0, 5);


    if (recentes.length === 0) {

        tabela.innerHTML = `

            <tr>

                <td colspan="5" class="empty-state">

                    <span>▤</span>

                    <strong>Nenhum trabalho cadastrado</strong>

                    <p>Seus trabalhos aparecerão aqui.</p>

                </td>

            </tr>

        `;

        return;

    }


    tabela.innerHTML = recentes.map(trabalho => {

        return `

            <tr class="linha-clicavel">

                <td>

                    <a
                        href="detalhes.html?id=${encodeURIComponent(trabalho.id)}"
                        style="color: inherit; text-decoration: none;"
                    >
                        ${escaparHTML(trabalho.cliente)}
                    </a>

                </td>

                <td>
                    ${escaparHTML(trabalho.servico)}
                </td>

                <td>
                    ${formatarData(trabalho.data)}
                </td>

                <td>
                    ${formatarDinheiro(trabalho.valorServico)}
                </td>

                <td>
                    ${escaparHTML(trabalho.status)}
                </td>

            </tr>

        `;

    }).join("");


    tabela.querySelectorAll(".linha-clicavel").forEach(linha => {

        linha.addEventListener("click", () => {

            const link = linha.querySelector("a");

            if (link) window.location.href = link.href;

        });

    });

}


/* =====================================================
   ATUALIZAR PAINEL
===================================================== */

function atualizarDashboard() {

    atualizarResumoFinanceiro();

    atualizarComparativo();

    atualizarSituacaoTrabalhos();

    atualizarTrabalhosRecentes();

}


/* =====================================================
   CARREGAR DADOS
===================================================== */

async function carregarDashboard() {

    try {

        const resposta = await apiGet("obterDadosDashboard");


        if (!resposta || !resposta.sucesso) {

            throw new Error(

                resposta?.mensagem ||

                "Não foi possível carregar o dashboard."

            );

        }


        dadosDashboard.trabalhos =

            resposta.trabalhos || [];


        dadosDashboard.pagamentos =

            resposta.pagamentos || [];


        configurarPeriodos();

        atualizarDashboard();


    } catch (erro) {

        console.error("Erro ao carregar dashboard:", erro);


        const tabela = $("corpoTrabalhosRecentes");


        if (tabela) {

            tabela.innerHTML = `

                <tr>

                    <td colspan="5" class="empty-state">

                        Não foi possível carregar os dados.

                    </td>

                </tr>

            `;

        }

    }

}


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    carregarDashboard();

});