"use strict";

/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const $ = id => document.getElementById(id);

const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
];

const zona = "America/Sao_Paulo";


/* =========================================================
   FORMATAÇÕES
========================================================= */

const brl = n =>
    (n / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

const centavos = n =>
    Math.round(Number(n) * 100);

const margem = (lucro, receita) =>
    receita
        ? (100 * lucro / receita).toLocaleString(
            "pt-BR",
            { maximumFractionDigits: 1 }
        ) + "%"
        : "—";


/* =========================================================
   CONVERTER DATA
========================================================= */

function periodo(data) {

    const texto = String(data || "");

    let resultado = texto.match(
        /^(\d{2})\/(\d{2})\/(\d{4})$/
    );

    if (resultado) {

        return [
            +resultado[3],
            +resultado[2]
        ];

    }

    resultado = texto.match(
        /^(\d{4})-(\d{2})-(\d{2})$/
    );

    if (resultado) {

        return [
            +resultado[1],
            +resultado[2]
        ];

    }

    const d = new Date(texto);

    if (!texto || !Number.isFinite(d.getTime())) {
        return null;
    }

    const partes = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "numeric",
        timeZone: zona
    }).formatToParts(d);

    return [
        +partes.find(x => x.type === "year").value,
        +partes.find(x => x.type === "month").value
    ];

}


/* =========================================================
   VARIÁVEIS
========================================================= */

const hoje = periodo(new Date().toISOString());

let registros = [];

let pronto = false;


/* =========================================================
   FUNÇÕES AUXILIARES
========================================================= */

function opcao(elemento, valor, texto) {

    elemento.add(new Option(texto, valor));

}


function total() {

    return {

        receita: 0,
        custos: 0,
        lucro: 0,
        unidades: 0,
        cmv: 0

    };

}


function somar(a, b) {

    Object.keys(a).forEach(chave => {

        a[chave] += b[chave];

    });

    return a;

}


/* =========================================================
   NORMALIZAR VENDAS
========================================================= */

function normalizar(venda) {

    const p = periodo(venda.data);

    if (!p || p[1] < 1 || p[1] > 12) {

        throw new Error(
            "Data inválida em venda ativa."
        );

    }

    const receita = centavos(venda.vendaTotal);

    const custos = centavos(venda.custoTotal);

    const unidades = Number(venda.quantidade);

    const cmv = centavos(
        Number(venda.custoUnitario) * unidades
    );

    if (
        ![receita, custos, unidades, cmv]
            .every(Number.isFinite)
    ) {

        throw new Error(
            "Valor inválido em venda ativa."
        );

    }

    return {

        ano: p[0],

        mes: p[1],

        modelo: String(
            venda.produto || "Não informado"
        ).trim(),

        val: {

            receita,
            custos,
            lucro: receita - custos,
            unidades,
            cmv

        }

    };

}


/* =========================================================
   RENDERIZAR PAINEL
========================================================= */

function render() {

    if (!pronto) return;

    const ano = Number($("ano").value);

    const mes = Number($("mes").value);

    const serie = meses.map(total);

    const ranking = new Map();

    const resumo = total();


    /* CALCULAR RESULTADOS */

    for (const venda of registros) {

        if (venda.ano !== ano) continue;

        somar(
            serie[venda.mes - 1],
            venda.val
        );

        if (mes && venda.mes !== mes) continue;

        somar(resumo, venda.val);

        const chave = venda.modelo.toLowerCase();

        if (!ranking.has(chave)) {

            ranking.set(chave, {

                nome: venda.modelo,

                val: total()

            });

        }

        somar(
            ranking.get(chave).val,
            venda.val
        );

    }


    /* ATUALIZAR INDICADORES */

    for (const chave of [

        "receita",
        "custos",
        "lucro",
        "cmv"

    ]) {

        $(chave).textContent = brl(resumo[chave]);

        $(chave).classList.toggle(
            "fin-negativo",
            resumo[chave] < 0
        );

    }

    $("unidades").textContent =
        resumo.unidades.toLocaleString("pt-BR");

    $("margem").textContent =
        margem(resumo.lucro, resumo.receita);


    /* ATUALIZAR TABELA */

    $("mensal").replaceChildren();

    serie.forEach((valor, indice) => {

        const tr = document.createElement("tr");

        const colunas = [

            meses[indice],

            valor.unidades,

            brl(valor.receita),

            brl(valor.custos),

            brl(valor.lucro),

            margem(valor.lucro, valor.receita)

        ];

        colunas.forEach((texto, coluna) => {

            const td = document.createElement("td");

            td.textContent = texto;

            if (
                valor.lucro < 0 &&
                (coluna === 4 || coluna === 5)
            ) {

                td.classList.add("fin-negativo");

            }

            tr.append(td);

        });

        $("mensal").append(tr);

    });


    /* ATUALIZAR RANKING E GRÁFICO */

    renderizarRanking(ranking);

    grafico(serie);

}


/* =========================================================
   MODELOS MAIS VENDIDOS
========================================================= */

function renderizarRanking(ranking) {

    const ranks = [...ranking.values()]

        .sort((a, b) =>

            b.val.unidades - a.val.unidades ||

            b.val.receita - a.val.receita ||

            a.nome.localeCompare(b.nome)

        )

        .slice(0, 10);

    $("ranking").replaceChildren();

    if (!ranks.length) {

        $("ranking").textContent =
            "Nenhuma venda no período.";

        return;

    }

    for (const item of ranks) {

        const div = document.createElement("div");

        const label = document.createElement("div");

        const nome = document.createElement("strong");

        const quantidade = document.createElement("span");

        const track = document.createElement("div");

        const fill = document.createElement("div");

        const info = document.createElement("small");


        label.className = "rank-label";

        nome.textContent = item.nome;

        quantidade.textContent =
            item.val.unidades + " un.";

        label.append(nome, quantidade);


        track.className = "rank-track";

        fill.className = "rank-fill";

        fill.style.width = (

            100 * item.val.unidades /

            Math.max(1, ranks[0].val.unidades)

        ) + "%";

        track.append(fill);


        info.textContent =

            brl(item.val.receita) +

            " faturados · " +

            brl(item.val.lucro) +

            " de lucro";


        div.append(label, track, info);

        $("ranking").append(div);

    }

}


/* =========================================================
   NOVO GRÁFICO COMPARATIVO FINANCEIRO
========================================================= */

function grafico(serie) {

    const container = $("grafico");

    container.replaceChildren();


    /* =====================================================
       FILTRAR MESES COM MOVIMENTAÇÃO
    ===================================================== */

    const dados = serie

        .map((valor, indice) => ({

            ...valor,

            mes: meses[indice]

        }))

        .filter(item =>

            item.receita !== 0 ||

            item.custos !== 0 ||

            item.lucro !== 0 ||

            item.unidades !== 0

        );


    if (!dados.length) {

        container.textContent =
            "Nenhuma movimentação financeira neste ano.";

        return;

    }


    /* =====================================================
       CONFIGURAÇÕES DO GRÁFICO
    ===================================================== */

    const cores = [

        "#d4af37",
        "#777777",
        "#26734a"

    ];

    const chaves = [

        "receita",
        "custos",
        "lucro"

    ];

    const nomes = [

        "Faturamento",
        "Custos",
        "Lucro"

    ];

    const ns = "http://www.w3.org/2000/svg";

    const larguraGrupo = 210;

    const largura = Math.max(

        520,

        dados.length * larguraGrupo + 110

    );

    const altura = 350;

    const esquerda = 90;

    const direita = largura - 20;

    const topo = 35;

    const base = 265;

    const larguraUtil = direita - esquerda;

    const grupo = larguraUtil / dados.length;

    const larguraBarra = Math.min(

        50,

        (grupo - 30) / 3

    );


    /* =====================================================
       ESCALA DE VALORES
    ===================================================== */

    const valores = dados.flatMap(item => [

        item.receita,
        item.custos,
        item.lucro

    ]);

    const maior = Math.max(1, ...valores);

    const menor = Math.min(0, ...valores);

    const intervalo = (maior - menor) / 5;

    const potencia = Math.pow(

        10,

        Math.floor(Math.log10(intervalo))

    );

    const passo =

        [1, 2, 2.5, 5, 10]

            .map(n => n * potencia)

            .find(n => n >= intervalo);

    const maximo =

        Math.ceil(maior / passo) * passo;

    const minimo =

        Math.floor(menor / passo) * passo;


    const y = valor =>

        topo +

        (maximo - valor) /

        (maximo - minimo) *

        (base - topo);


    /* =====================================================
       FORMATAÇÃO DOS VALORES
    ===================================================== */

    function valorCurto(valor) {

        const reais = valor / 100;

        if (Math.abs(reais) >= 1000000) {

            return (

                reais / 1000000

            ).toLocaleString("pt-BR", {

                maximumFractionDigits: 1

            }) + " mi";

        }

        if (Math.abs(reais) >= 1000) {

            return (

                reais / 1000

            ).toLocaleString("pt-BR", {

                maximumFractionDigits: 1

            }) + " mil";

        }

        return reais.toLocaleString("pt-BR", {

            maximumFractionDigits: 2

        });

    }


    /* =====================================================
       CRIAR SVG
    ===================================================== */

    const svg = document.createElementNS(ns, "svg");

    svg.setAttribute(
        "viewBox",
        `0 0 ${largura} ${altura}`
    );

    svg.setAttribute("role", "group");

    svg.setAttribute(
        "aria-label",
        "Comparativo financeiro mensal"
    );

    svg.style.minWidth = largura + "px";

    svg.style.width = "100%";

    svg.style.height = "auto";


    function criarElemento(tag, atributos, texto) {

        const elemento =
            document.createElementNS(ns, tag);

        Object.entries(atributos)

            .forEach(([chave, valor]) => {

                elemento.setAttribute(chave, valor);

            });

        if (texto !== undefined) {

            elemento.textContent = texto;

        }

        svg.appendChild(elemento);

        return elemento;

    }


    /* =====================================================
       ESCALA LATERAL EM REAIS
    ===================================================== */

    const quantidadeLinhas = Math.round(

        (maximo - minimo) / passo

    );

    for (let i = 0; i <= quantidadeLinhas; i++) {

        const valor = minimo + i * passo;

        const posicaoY = y(valor);

        criarElemento("line", {

            x1: esquerda,

            x2: direita,

            y1: posicaoY,

            y2: posicaoY,

            stroke: "#dddddd",

            "stroke-dasharray": "4 4"

        });

        criarElemento("text", {

            x: esquerda - 12,

            y: posicaoY + 4,

            "text-anchor": "end",

            "font-size": 11,

            fill: "#777777"

        }, "R$ " + valorCurto(valor));

    }


    /* =====================================================
       LINHA BASE
    ===================================================== */

    criarElemento("line", {

        x1: esquerda,

        x2: direita,

        y1: y(0),

        y2: y(0),

        stroke: "#999999",

        "stroke-width": 1

    });


    /* =====================================================
       INFORMAÇÕES INTERATIVAS
    ===================================================== */

    const informacao = document.createElement("div");

    informacao.className = "fin-grafico-info";

    informacao.setAttribute("aria-live", "polite");

    informacao.textContent =

        "Passe o mouse ou toque em uma barra para consultar o valor completo.";


    /* =====================================================
       GERAR BARRAS
    ===================================================== */

    dados.forEach((item, indice) => {

        const centro =

            esquerda +

            indice * grupo +

            grupo / 2;

        const inicio =

            centro -

            (larguraBarra * 3 + 16) / 2;


        chaves.forEach((chave, coluna) => {

            const valor = item[chave];

            const posicaoX =

                inicio +

                coluna * (larguraBarra + 8);

            const posicaoY =

                Math.min(y(valor), y(0));

            const alturaBarra =

                Math.abs(y(valor) - y(0));


            /* BARRA */

            const barra = criarElemento("rect", {

                x: posicaoX,

                y: valor === 0
                    ? y(0) - 1
                    : posicaoY,

                width: larguraBarra,

                height: Math.max(1, alturaBarra),

                rx: 4,

                fill: cores[coluna],

                tabindex: 0,

                role: "button",

                class: "fin-barra",

                "aria-label":

                    item.mes + " — " +

                    nomes[coluna] + ": " +

                    brl(valor)

            });


            /* VALOR COMPLETO */

            const titulo =

                document.createElementNS(ns, "title");

            titulo.textContent =

                item.mes + " — " +

                nomes[coluna] + ": " +

                brl(valor);

            barra.appendChild(titulo);


            /* INTERAÇÃO */

            function mostrarInformacao() {

                informacao.textContent =

                    item.mes + " • " +

                    nomes[coluna] + ": " +

                    brl(valor);

            }

            barra.addEventListener(
                "mouseenter",
                mostrarInformacao
            );

            barra.addEventListener(
                "focus",
                mostrarInformacao
            );

            barra.addEventListener(
                "click",
                mostrarInformacao
            );

            barra.addEventListener(

                "keydown",

                evento => {

                    if (
                        evento.key === "Enter" ||
                        evento.key === " "
                    ) {

                        evento.preventDefault();

                        mostrarInformacao();

                    }

                }

            );


            /* VALOR SOBRE A BARRA */

            criarElemento("text", {

                x: posicaoX + larguraBarra / 2,

                y: valor >= 0

                    ? posicaoY - 9

                    : posicaoY + alturaBarra + 13,

                "text-anchor": "middle",

                "font-size": 10,

                "font-weight": 600,

                fill: valor < 0
                    ? "#c62828"
                    : "#444444",

                "pointer-events": "none"

            }, valorCurto(valor));

        });


        /* NOME DO MÊS */

        criarElemento("text", {

            x: centro,

            y: base + 32,

            "text-anchor": "middle",

            "font-size": 13,

            "font-weight": 600,

            fill: "#222222"

        }, item.mes);


        /* MARGEM DE LUCRO DO MÊS */

        criarElemento("text", {

            x: centro,

            y: base + 54,

            "text-anchor": "middle",

            "font-size": 11,

            fill: item.lucro < 0

                ? "#c62828"

                : "#26734a"

        }, "Margem: " + margem(

            item.lucro,

            item.receita

        ));

    });


    /* =====================================================
       EXIBIR GRÁFICO
    ===================================================== */

    const area = document.createElement("div");

    area.className = "fin-grafico-area";

    area.appendChild(svg);

    container.appendChild(area);

    container.appendChild(informacao);

}


/* =========================================================
   CARREGAR VENDAS DO GOOGLE PLANILHAS
========================================================= */

async function carregar() {

    const botao = $("atualizar");

    botao.disabled = true;

    botao.textContent = "⏳ Atualizando...";

    $("situacao").textContent =

        "Carregando vendas...";

    try {

        const url = new URL(CONFIG.URL_SCRIPT);

        url.searchParams.set(
            "acao",
            "listarVendas"
        );

        const resposta = await fetch(url, {

            cache: "no-store"

        });

        if (!resposta.ok) {

            throw new Error(
                "Falha HTTP " + resposta.status
            );

        }

        const dados = await resposta.json();

        if (
            !dados.sucesso ||
            !Array.isArray(dados.vendas)
        ) {

            throw new Error(

                dados.mensagem ||
                "Resposta inválida."

            );

        }


        /* EXCLUIR VENDAS CANCELADAS */

        registros = dados.vendas

            .filter(venda =>

                String(venda.status || "Ativa")

                    .trim()

                    .toLowerCase() === "ativa"

            )

            .map(normalizar);


        /* PREENCHER ANOS DISPONÍVEIS */

        const anoAnterior =

            Number($("ano").value) || hoje[0];

        const anos = [

            ...new Set([

                hoje[0],

                ...registros.map(venda => venda.ano)

            ])

        ].sort((a, b) => b - a);

        $("ano").replaceChildren();

        anos.forEach(ano => {

            opcao($("ano"), ano, ano);

        });

        $("ano").value =

            anos.includes(anoAnterior)

                ? anoAnterior

                : hoje[0];


        /* ATUALIZAR PAINEL */

        pronto = true;

        render();

        $("situacao").textContent =

            "Atualizado em " +

            new Date().toLocaleTimeString("pt-BR", {

                timeZone: zona

            });

    } catch (erro) {

        console.error(

            "Erro ao carregar financeiro:",

            erro

        );

        $("situacao").textContent =

            (pronto ? "Dados anteriores — " : "") +

            "Erro ao carregar: " +

            erro.message;

    } finally {

        botao.disabled = false;

        botao.textContent = "🔄 Atualizar";

    }

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

opcao(

    $("mes"),

    0,

    "Todos os meses"

);

meses.forEach((mes, indice) => {

    opcao(

        $("mes"),

        indice + 1,

        mes

    );

});

$("mes").value = hoje[1];

opcao(

    $("ano"),

    hoje[0],

    hoje[0]

);


/* =========================================================
   EVENTOS
========================================================= */

$("mes").addEventListener(

    "change",

    render

);

$("ano").addEventListener(

    "change",

    render

);

$("atualizar").addEventListener(

    "click",

    carregar

);


/* =========================================================
   CARREGAMENTO INICIAL
========================================================= */

carregar();