// ==========================================
// CONFIGURAÇÃO
// ==========================================

CONFIG.URL_SCRIPT

// ==========================================
// VARIÁVEIS
// ==========================================

let vendas = [];
let estoque = [];


// ==========================================
// ELEMENTOS
// ==========================================

const listaVendas = document.getElementById("listaVendas");
const estadoVazioVendas = document.getElementById("estadoVazioVendas");

const campoPesquisaVenda =
    document.getElementById("campoPesquisaVenda");

const totalVendido =
    document.getElementById("totalVendido");

const totalCusto =
    document.getElementById("totalCusto");

const totalLucro =
    document.getElementById("totalLucro");

const loteVenda =
    document.getElementById("loteVenda");

const quantidadeVenda =
    document.getElementById("quantidadeVenda");

const valorVenda =
    document.getElementById("valorVenda");

const clienteVenda =
    document.getElementById("clienteVenda");

const observacaoVenda =
    document.getElementById("observacaoVenda");

const canalVenda =
    document.getElementById("canalVenda");

const taxaVenda =
    document.getElementById("taxaVenda");

const freteVenda =
    document.getElementById("freteVenda");

const fretePagoPor =
    document.getElementById("fretePagoPor");

const outrosCustos =
    document.getElementById("outrosCustos");

const calculoFrete =
    document.getElementById("calculoFrete");

const calculoTaxa =
    document.getElementById("calculoTaxa");

const calculoOutrosCustos =
    document.getElementById("calculoOutrosCustos");

const modalDetalhesVenda =
    document.getElementById("modalDetalhesVenda");

const btnFecharDetalhesVenda =
    document.getElementById("btnFecharDetalhesVenda");

const btnReverterDetalhe =
    document.getElementById("btnReverterDetalhe");

// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    carregarVendas();
    carregarEstoque();

    configurarEventos();

});


// ==========================================
// EVENTOS
// ==========================================

function configurarEventos() {

    campoPesquisaVenda.addEventListener(
        "input",
        pesquisarVendas
    );


    document
        .getElementById("btnNovaVenda")
        .addEventListener(
            "click",
            abrirModalVenda
        );


    document
        .getElementById("btnNovaVendaVazio")
        .addEventListener(
            "click",
            abrirModalVenda
        );


    document
        .getElementById("btnFecharModalVenda")
        .addEventListener(
            "click",
            fecharModalVenda
        );


    document
        .getElementById("btnCancelarVenda")
        .addEventListener(
            "click",
            fecharModalVenda
        );


    document
        .getElementById("formVenda")
        .addEventListener(
            "submit",
            salvarVenda
        );


    loteVenda.addEventListener(
        "change",
        atualizarInformacoesLote
    );


    quantidadeVenda.addEventListener(
        "input",
        atualizarCalculoVenda
    );


    valorVenda.addEventListener(
        "input",
        atualizarCalculoVenda
    );

    canalVenda.addEventListener(
    "change",
    atualizarTaxaPorCanal
    );

    taxaVenda.addEventListener(
        "input",
        atualizarCalculoVenda
    );

    freteVenda.addEventListener(
        "input",
        atualizarCalculoVenda
    );

    fretePagoPor.addEventListener(
        "change",
        atualizarCalculoVenda
    );

    outrosCustos.addEventListener(
        "input",
        atualizarCalculoVenda
    );

    btnFecharDetalhesVenda.addEventListener(
    "click",
    fecharDetalhesVenda
    );

    btnReverterDetalhe.addEventListener(
        "click",
        reverterVendaDetalhe
    );

}


// ==========================================
// CARREGAR VENDAS
// ==========================================

async function carregarVendas() {

    try {

        const resposta = await fetch(
            `${CONFIG.URL_SCRIPT}?acao=listarVendas`
        );

        const resultado = await resposta.json();

        if (!resultado.sucesso) {

            throw new Error(
                resultado.mensagem ||
                "Erro ao carregar vendas."
            );

        }

        vendas = resultado.vendas || [];

        renderizarVendas();

    } catch (erro) {

        console.error(
            "Erro ao carregar vendas:",
            erro
        );

        listaVendas.innerHTML = `
            <tr>
                <td colspan="7">
                    Erro ao carregar as vendas.
                </td>
            </tr>
        `;

    }

}


// ==========================================
// CARREGAR ESTOQUE
// ==========================================

async function carregarEstoque() {

    try {

        const resposta = await fetch(
            `${CONFIG.URL_SCRIPT}?acao=listarEstoque`
        );

        const resultado = await resposta.json();

        if (!resultado.sucesso) {

            throw new Error(
                resultado.mensagem ||
                "Erro ao carregar estoque."
            );

        }

        estoque = resultado.estoque || [];

        preencherLotes();

    } catch (erro) {

        console.error(
            "Erro ao carregar estoque:",
            erro
        );

    }

}


// ==========================================
// VENDAS DO MÊS ATUAL
// ==========================================

function obterVendasDoMes() {

    const agora = new Date();

    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();

    return vendas.filter(venda => {

        const data = converterData(
            venda.data
        );

        if (!data) {
            return false;
        }

        return (
            data.getMonth() === mesAtual &&
            data.getFullYear() === anoAtual
        );

    });

}


// ==========================================
// RENDERIZAR VENDAS
// ==========================================

function renderizarVendas(lista = null) {

    const pesquisando =
        campoPesquisaVenda.value.trim() !== "";

    const vendasExibidas = lista ||
        (
            pesquisando
                ? vendas
                : obterVendasDoMes()
        );


    listaVendas.innerHTML = "";


    atualizarResumo(
        obterVendasDoMes()
    );


    if (vendasExibidas.length === 0) {

        estadoVazioVendas.style.display = "block";

        return;

    }


    estadoVazioVendas.style.display = "none";


    vendasExibidas.forEach(venda => {

        const tr =
            document.createElement("tr");


        const dataFormatada =
            formatarData(venda.data);


        tr.innerHTML = `

    <td>
        ${dataFormatada}
    </td>

    <td>
        <strong>
            ${escapeHTML(venda.produto)}
        </strong>

        <small>
            ${
                venda.capacidade === "1"
                    ? "100%"
                    : escapeHTML(venda.capacidade)
            }
        </small>
    </td>

    <td>
        ${escapeHTML(venda.marca)}
    </td>

    <td>
        ${venda.quantidade}
    </td>

    <td>
        ${formatarMoeda(venda.vendaTotal)}
    </td>

    <td>
        ${formatarMoeda(venda.lucro)}
    </td>

    <td class="acoes-venda">

        <button
            type="button"
            class="btn-detalhes"
            onclick="abrirDetalhesVenda('${escapeHTML(venda.id)}')"
        >
            Detalhes
        </button>

        ${
            venda.status === "Revertida"

            ? `
                <span class="status-revertida">
                    Revertida
                </span>
            `

            : `
                <button
                    type="button"
                    class="btn-reverter"
                    onclick="reverterVenda('${escapeHTML(venda.id)}')"
                >
                    Reverter
                </button>
            `
        }

    </td>

`;


        listaVendas.appendChild(tr);

    });

}


// ==========================================
// PESQUISA
// ==========================================

function pesquisarVendas() {

    const termo =
        campoPesquisaVenda.value
            .trim()
            .toLowerCase();


    // Sem pesquisa:
    // volta para o mês atual

    if (!termo) {

        renderizarVendas();

        return;

    }


    // Com pesquisa:
    // procura em TODO o histórico

    const resultados =
        vendas.filter(venda => {

            const texto = [

                venda.id,
                venda.produto,
                venda.marca,
                venda.capacidade,
                venda.cliente,
                venda.observacao

            ]
                .join(" ")
                .toLowerCase();


            return texto.includes(termo);

        });


    renderizarVendas(resultados);

}


// ==========================================
// RESUMO
// ==========================================

function atualizarResumo(lista) {

    let vendido = 0;
    let custo = 0;
    let lucro = 0;


    lista
        .filter(venda =>
            venda.status !== "Revertida"
        )
        .forEach(venda => {

            vendido += Number(
                venda.vendaTotal || 0
            );

            custo += Number(
                venda.custoTotal || 0
            );

            lucro += Number(
                venda.lucro || 0
            );

        });


    totalVendido.textContent =
        formatarMoeda(vendido);

    totalCusto.textContent =
        formatarMoeda(custo);

    totalLucro.textContent =
        formatarMoeda(lucro);

}


// ==========================================
// PREENCHER LOTES
// ==========================================

function preencherLotes() {

    loteVenda.innerHTML = `
        <option value="">
            Selecione o lote
        </option>
    `;


    estoque
        .filter(produto =>
            Number(produto.quantidade || 0) > 0
        )
        .forEach(produto => {

            const option =
                document.createElement("option");


            option.value =
                produto.id;


            option.textContent =
                `${produto.modelo} — ${produto.marca || "Sem marca"} — ${produto.capacidade} — ${produto.quantidade} un. — ${formatarMoeda(produto.custo)}`;


            loteVenda.appendChild(option);

        });

}


// ==========================================
// INFORMAÇÕES DO LOTE
// ==========================================

function atualizarInformacoesLote() {

    const id =
        loteVenda.value;


    const produto =
        estoque.find(item =>
            String(item.id) === String(id)
        );


    const bloco =
        document.getElementById(
            "informacoesLote"
        );


    if (!produto) {

        bloco.style.display = "none";

        atualizarCalculoVenda();

        return;

    }


    bloco.style.display = "grid";


    document.getElementById(
        "vendaProduto"
    ).textContent =
        produto.modelo;


    document.getElementById(
        "vendaMarca"
    ).textContent =
        produto.marca || "-";


    document.getElementById(
        "vendaCapacidade"
    ).textContent =
        produto.capacidade;


    document.getElementById(
        "vendaEstoque"
    ).textContent =
        produto.quantidade;


    document.getElementById(
        "vendaCusto"
    ).textContent =
        formatarMoeda(produto.custo);


    quantidadeVenda.max =
        produto.quantidade;


    atualizarCalculoVenda();

}


// ==========================================
// CALCULAR VENDA
// ==========================================

// ==========================================
// CALCULAR VENDA
// ==========================================

function atualizarCalculoVenda() {

    const id =
        loteVenda.value;


    const produto =
        estoque.find(item =>
            String(item.id) === String(id)
        );


    const quantidade =
        Number(
            quantidadeVenda.value || 0
        );


    const valorUnitario =
        Number(
            valorVenda.value || 0
        );


    const custoUnitario =
        produto
            ? Number(produto.custo || 0)
            : 0;


    // ------------------------------
    // VALORES BÁSICOS
    // ------------------------------

    const custoTotal =
        quantidade * custoUnitario;


    const vendaTotal =
        quantidade * valorUnitario;


    // ------------------------------
    // TAXA DO CANAL
    // ------------------------------

    const taxa =
        Number(
            taxaVenda.value || 0
        );


    const valorTaxa =
        vendaTotal * (taxa / 100);


    // ------------------------------
    // FRETE
    // ------------------------------

    const frete =
        Number(
            freteVenda.value || 0
        );


    const freteCusto =
        fretePagoPor.value === "nos"
            ? frete
            : 0;


    // ------------------------------
    // OUTROS CUSTOS
    // ------------------------------

    const valorOutrosCustos =
        Number(
            outrosCustos.value || 0
        );


    // ------------------------------
    // LUCRO REAL
    // ------------------------------

    const lucro =
        vendaTotal
        - custoTotal
        - valorTaxa
        - freteCusto
        - valorOutrosCustos;


    // ------------------------------
    // ATUALIZAR TELA
    // ------------------------------

    calculoCusto.textContent =
        formatarMoeda(custoTotal);


    calculoVenda.textContent =
        formatarMoeda(vendaTotal);


    calculoFrete.textContent =
        formatarMoeda(freteCusto);


    calculoTaxa.textContent =
        formatarMoeda(valorTaxa);


    calculoOutrosCustos.textContent =
        formatarMoeda(valorOutrosCustos);


    document.getElementById(
        "calculoLucro"
    ).textContent =
        formatarMoeda(lucro);

}

// ==========================================
// TAXA PADRÃO POR CANAL
// ==========================================

function atualizarTaxaPorCanal() {

    const taxasPadrao = {

        "Mercado Livre": 15,
        "Assistência": 0,
        "Venda direta": 0,
        "Outro": 0

    };

    const canal =
        canalVenda.value;

    const taxa =
        taxasPadrao[canal] ?? 0;

    taxaVenda.value = taxa;

    atualizarCalculoVenda();

}

// ==========================================
// ABRIR MODAL
// ==========================================

function abrirModalVenda() {

    document
        .getElementById("modalVenda")
        .classList.add("aberto");


    document
        .getElementById("formVenda")
        .reset();


    document.getElementById(
        "informacoesLote"
    ).style.display = "none";


    document.getElementById(
        "calculoCusto"
    ).textContent = "R$ 0,00";


    document.getElementById(
        "calculoVenda"
    ).textContent = "R$ 0,00";


    document.getElementById(
        "calculoLucro"
    ).textContent = "R$ 0,00";

    document.getElementById(
    "calculoFrete"
    ).textContent = "R$ 0,00";

    document.getElementById(
        "calculoTaxa"
    ).textContent = "R$ 0,00";

    document.getElementById(
        "calculoOutrosCustos"
    ).textContent = "R$ 0,00";

    canalVenda.value = "";
    taxaVenda.value = "0";
    freteVenda.value = "0";
    fretePagoPor.value = "cliente";
    outrosCustos.value = "0";
}


// ==========================================
// FECHAR MODAL
// ==========================================

function fecharModalVenda() {

    document
        .getElementById("modalVenda")
        .classList.remove("aberto");

}

function abrirDetalhesVenda(idVenda) {

    const venda =
        vendas.find(item =>
            String(item.id) ===
            String(idVenda)
        );


    if (!venda) {

        alert(
            "Venda não encontrada."
        );

        return;

    }


    document.getElementById(
        "detalheProduto"
    ).textContent =
        venda.produto || "-";


    document.getElementById(
        "detalheMarca"
    ).textContent =
        venda.marca || "-";


    document.getElementById(
        "detalheCapacidade"
    ).textContent =
        venda.capacidade === "1"
            ? "100%"
            : venda.capacidade || "-";


    document.getElementById(
        "detalheQuantidade"
    ).textContent =
        venda.quantidade;


    document.getElementById(
        "detalheLote"
    ).textContent =
        venda.idLote || "-";


    document.getElementById(
        "detalheStatus"
    ).textContent =
        venda.status || "Ativa";


    document.getElementById(
        "detalheCustoUnitario"
    ).textContent =
        formatarMoeda(
            venda.custoUnitario
        );


    document.getElementById(
        "detalheValorVenda"
    ).textContent =
        formatarMoeda(
            venda.valorVendaUnitario
        );


    document.getElementById(
        "detalheVendaTotal"
    ).textContent =
        formatarMoeda(
            venda.vendaTotal
        );


    const custoProduto =
        Number(venda.quantidade || 0) *
        Number(venda.custoUnitario || 0);


    document.getElementById(
        "detalheCustoProduto"
    ).textContent =
        formatarMoeda(
            custoProduto
        );


    document.getElementById(
        "detalheTaxa"
    ).textContent =
        formatarMoeda(
            venda.valorTaxa
        );


    const freteCusto =
        venda.fretePagoPor === "nos"
            ? Number(venda.frete || 0)
            : 0;


    document.getElementById(
        "detalheFrete"
    ).textContent =
        formatarMoeda(
            freteCusto
        );


    document.getElementById(
        "detalheOutrosCustos"
    ).textContent =
        formatarMoeda(
            venda.outrosCustos
        );


    document.getElementById(
        "detalheCustoTotal"
    ).textContent =
        formatarMoeda(
            venda.custoTotal
        );


    document.getElementById(
        "detalheLucro"
    ).textContent =
        formatarMoeda(
            venda.lucro
        );


    document.getElementById(
        "detalheData"
    ).textContent =
        formatarData(
            venda.data
        );


    document.getElementById(
        "detalheCanal"
    ).textContent =
        venda.canal || "-";


    document.getElementById(
        "detalheTaxaPercentual"
    ).textContent =
        `${Number(venda.taxa || 0)}%`;


    document.getElementById(
        "detalheFretePagoPor"
    ).textContent =
        venda.fretePagoPor === "nos"
            ? "Nós"
            : "Cliente";


    document.getElementById(
        "detalheCliente"
    ).textContent =
        venda.cliente || "-";


    document.getElementById(
        "detalheObservacao"
    ).textContent =
        venda.observacao || "-";


    /*
     * Guarda a venda atualmente aberta.
     */

    btnReverterDetalhe.dataset.idVenda =
        venda.id;


    /*
     * Se já estiver revertida,
     * desabilita o botão.
     */

    if (
        venda.status === "Revertida"
    ) {

        btnReverterDetalhe.disabled =
            true;

        btnReverterDetalhe.textContent =
            "Venda revertida";

    } else {

        btnReverterDetalhe.disabled =
            false;

        btnReverterDetalhe.textContent =
            "Reverter venda";

    }


    modalDetalhesVenda.classList.add(
        "aberto"
    );

}

function fecharDetalhesVenda() {

    modalDetalhesVenda.classList.remove(
        "aberto"
    );

}

function reverterVendaDetalhe() {

    const idVenda =
        btnReverterDetalhe.dataset.idVenda;


    if (!idVenda) {

        return;

    }


    fecharDetalhesVenda();

    reverterVenda(idVenda);

}


// ==========================================
// SALVAR VENDA
// ==========================================

async function salvarVenda(event) {

    event.preventDefault();


    const id =
        loteVenda.value;


    const quantidade =
        Number(
            quantidadeVenda.value
        );


    const valorVenda =
        Number(
            valorVendaInput()
        );


    const cliente =
        clienteVenda.value.trim();


    const observacao =
        observacaoVenda.value.trim();
      
    const canal =
    canalVenda.value;

    const taxa =
        Number(
            taxaVenda.value || 0
        );

    const frete =
        Number(
            freteVenda.value || 0
        );

    const pagoFretePor =
        fretePagoPor.value;

    const outrosCustosValor =
        Number(
            outrosCustos.value || 0
        );    

    if (!id) {

        alert(
            "Selecione um lote."
        );

        return;

    }


    if (
        !Number.isInteger(quantidade) ||
        quantidade <= 0
    ) {

        alert(
            "Informe uma quantidade válida."
        );

        return;

    }


    if (
        isNaN(valorVenda) ||
        valorVenda < 0
    ) {

        alert(
            "Informe um valor de venda válido."
        );

        return;

    }

    if (!canal) {

    alert(
        "Selecione o canal da venda."
    );

    return;

    }

    if (
        isNaN(taxa) ||
        taxa < 0
    ) {

        alert(
            "Informe uma taxa válida."
        );

        return;

    }

    if (
        isNaN(frete) ||
        frete < 0
    ) {

        alert(
            "Informe um valor de frete válido."
        );

        return;

    }

    if (
        isNaN(outrosCustosValor) ||
        outrosCustosValor < 0
    ) {

        alert(
            "Informe um valor válido para outros custos."
        );

        return;

    }


    const produto =
        estoque.find(item =>
            String(item.id) === String(id)
        );


    if (!produto) {

        alert(
            "Lote não encontrado."
        );

        return;

    }


    if (
        quantidade >
        Number(produto.quantidade || 0)
    ) {

        alert(
            `Estoque insuficiente. Disponível: ${produto.quantidade} unidade(s).`
        );

        return;

    }


    const botao =
        document.querySelector(
            '#formVenda button[type="submit"]'
        );


    botao.disabled = true;
    botao.textContent =
        "Registrando...";


    try {

        const dados =
            new URLSearchParams();


        dados.append(
            "acao",
            "registrarVenda"
        );


        dados.append(
            "id",
            id
        );


        dados.append(
            "quantidade",
            quantidade
        );


        dados.append(
            "valorVenda",
            valorVenda
        );


        dados.append(
            "cliente",
            cliente
        );


        dados.append(
            "observacao",
            observacao
        );

        dados.append(
            "canal",
            canal
        );

        dados.append(
            "taxa",
            taxa
        );

        dados.append(
            "frete",
            frete
        );

        dados.append(
            "fretePagoPor",
            pagoFretePor
        );

        dados.append(
            "outrosCustos",
            outrosCustosValor
        );


        const resposta =
            await fetch(
                CONFIG.URL_SCRIPT,
                {
                    method: "POST",
                    body: dados
                }
            );


        const resultado =
            await resposta.json();


        if (!resultado.sucesso) {

            throw new Error(
                resultado.mensagem ||
                "Erro ao registrar venda."
            );

        }


        alert(
            "Venda registrada com sucesso!"
        );


        fecharModalVenda();


        await carregarVendas();
        await carregarEstoque();


    } catch (erro) {

        console.error(
            "Erro ao registrar venda:",
            erro
        );


        alert(
            erro.message ||
            "Não foi possível registrar a venda."
        );

    } finally {

        botao.disabled = false;
        botao.textContent =
            "Registrar venda";

    }

}


// ==========================================
// VALOR DE VENDA
// ==========================================

function valorVendaInput() {

    return valorVenda.value;

}


// ==========================================
// CONVERTER DATA
// ==========================================

function converterData(valor) {

    if (!valor) {
        return null;
    }


    const data =
        new Date(valor);


    if (isNaN(data.getTime())) {
        return null;
    }


    return data;

}


// ==========================================
// FORMATAR DATA
// ==========================================

function formatarData(valor) {

    const data =
        converterData(valor);


    if (!data) {
        return "-";
    }


    return data.toLocaleDateString(
        "pt-BR"
    );

}


// ==========================================
// FORMATAR MOEDA
// ==========================================

function formatarMoeda(valor) {

    return Number(valor || 0)
        .toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

}

async function reverterVenda(idVenda) {

    const venda =
        vendas.find(venda =>
            String(venda.id) ===
            String(idVenda)
        );


    if (!venda) {

        alert(
            "Venda não encontrada."
        );

        return;

    }


    if (
        venda.status === "Revertida"
    ) {

        alert(
            "Esta venda já foi revertida."
        );

        return;

    }


    const confirmar =
        confirm(
            `Deseja realmente reverter esta venda?\n\n` +
            `Produto: ${venda.produto}\n` +
            `Quantidade: ${venda.quantidade}\n` +
            `Valor: ${formatarMoeda(venda.vendaTotal)}`
        );


    if (!confirmar) {

        return;

    }


    try {

        const dados =
            new URLSearchParams();


        dados.append(
            "acao",
            "reverterVenda"
        );


        dados.append(
            "idVenda",
            idVenda
        );


        const resposta =
            await fetch(
                CONFIG.URL_SCRIPT,
                {
                    method: "POST",
                    body: dados
                }
            );


        const resultado =
            await resposta.json();


        if (!resultado.sucesso) {

            throw new Error(
                resultado.mensagem ||
                "Erro ao reverter venda."
            );

        }


        alert(
            "Venda revertida com sucesso!"
        );


        await carregarVendas();

        await carregarEstoque();


    } catch (erro) {

        console.error(
            "Erro ao reverter venda:",
            erro
        );


        alert(
            erro.message ||
            "Não foi possível reverter a venda."
        );

    }

}

// ==========================================
// ESCAPAR HTML
// ==========================================

function escapeHTML(valor) {

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}