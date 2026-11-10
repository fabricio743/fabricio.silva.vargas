
/* =====================================================
   GESTÃO DE TRABALHOS
   LISTAGEM E FILTROS
===================================================== */

const $ = id => document.getElementById(id);

let todosTrabalhos = [];


/* =====================================================
   FUNÇÕES AUXILIARES
===================================================== */

function dinheiro(valor) {

    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}


function escaparHTML(valor) {

    return String(valor ?? "").replace(/[&<>"']/g, caractere => {

        const entidades = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entidades[caractere];

    });

}


function dataISO(valor) {

    if (!valor) return "";

    const texto = String(valor);

    if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
        return texto;
    }

    if (/^\d{4}-\d{2}-\d{2}T/.test(texto)) {
        return texto.substring(0, 10);
    }

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return "";
    }

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;

}


function formatarData(valor) {

    const data = dataISO(valor);

    if (!data) return "—";

    const [ano, mes, dia] = data.split("-");

    return `${dia}/${mes}/${ano}`;

}


function classeStatus(status) {

    const classes = {
        "Em andamento": "andamento",
        "Aguardando aprovação": "aprovacao",
        "Aguardando peça": "peca",
        "Concluído": "concluido",
        "Entregue": "entregue",
        "Cancelado": "cancelado"
    };

    return classes[status] || "andamento";

}


/* =====================================================
   CARREGAR TRABALHOS
===================================================== */

async function carregarTrabalhos() {

    const lista = $("listaTrabalhos");

    $("contadorTrabalhos").textContent = "Atualizando registros...";

    lista.innerHTML = `
        <tr>
            <td colspan="7" class="empty-state">
                Carregando trabalhos...
            </td>
        </tr>
    `;

    try {

        const resposta = await apiGet("listarTrabalhos");

        if (!resposta || !resposta.sucesso) {
            throw new Error(
                resposta?.mensagem || "Não foi possível carregar os trabalhos."
            );
        }

        todosTrabalhos = Array.isArray(resposta.trabalhos)
            ? resposta.trabalhos
            : [];

        preencherCategorias();
        aplicarFiltros();

    } catch (erro) {

        console.error("Erro ao carregar trabalhos:", erro);

        $("contadorTrabalhos").textContent = "Falha ao carregar os registros.";

        lista.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    Não foi possível carregar os trabalhos.
                    <p>Verifique a conexão e tente atualizar.</p>
                </td>
            </tr>
        `;

    }

}


/* =====================================================
   PREENCHER CATEGORIAS
===================================================== */

function preencherCategorias() {

    const select = $("filtroCategoria");
    const categoriaAtual = select.value;

    const categorias = [...new Set(
        todosTrabalhos
            .map(trabalho => trabalho.categoria)
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, "pt-BR"));

    select.innerHTML = `
        <option value="">Todas as categorias</option>
    `;

    categorias.forEach(categoria => {

        const option = document.createElement("option");

        option.value = categoria;
        option.textContent = categoria;

        select.appendChild(option);

    });

    if (categorias.includes(categoriaAtual)) {
        select.value = categoriaAtual;
    }

}


/* =====================================================
   APLICAR FILTROS
===================================================== */

function aplicarFiltros() {

    const pesquisa = $("pesquisaTrabalho")
        .value.trim().toLowerCase();

    const status = $("filtroStatus").value;
    const categoria = $("filtroCategoria").value;

    const dataInicial = $("dataInicial").value;
    const dataFinal = $("dataFinal").value;

    const filtrados = todosTrabalhos.filter(trabalho => {

        const cliente = String(trabalho.cliente || "").toLowerCase();
        const servico = String(trabalho.servico || "").toLowerCase();

        const correspondePesquisa =
            cliente.includes(pesquisa) ||
            servico.includes(pesquisa);

        const correspondeStatus =
            !status || trabalho.status === status;

        const correspondeCategoria =
            !categoria || trabalho.categoria === categoria;

        const data = dataISO(trabalho.data);

        const correspondeDataInicial =
            !dataInicial || (data && data >= dataInicial);

        const correspondeDataFinal =
            !dataFinal || (data && data <= dataFinal);

        return (
            correspondePesquisa &&
            correspondeStatus &&
            correspondeCategoria &&
            correspondeDataInicial &&
            correspondeDataFinal
        );

    });

    filtrados.sort((a, b) => {

        const dataA = dataISO(a.data);
        const dataB = dataISO(b.data);

        return dataB.localeCompare(dataA);

    });

    renderizarTrabalhos(filtrados);

}


/* =====================================================
   RENDERIZAR TABELA
===================================================== */

function renderizarTrabalhos(trabalhos) {

    const lista = $("listaTrabalhos");

    $("contadorTrabalhos").textContent =
        `${trabalhos.length} trabalho(s) encontrado(s)`;

    if (!trabalhos.length) {

        lista.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <span>▤</span>
                    <strong>Nenhum trabalho encontrado</strong>
                    <p>Experimente alterar os filtros da pesquisa.</p>
                </td>
            </tr>
        `;

        return;

    }

    lista.innerHTML = trabalhos.map(trabalho => {

        const status = escaparHTML(trabalho.status || "Sem status");
        const classe = classeStatus(trabalho.status);

        return `
            <tr
                data-id="${escaparHTML(trabalho.id)}"
                class="linha-clicavel"
                title="Clique para visualizar os detalhes"
            >

                <td>
                    <strong>${escaparHTML(trabalho.cliente)}</strong>
                </td>

                <td>
                    ${escaparHTML(trabalho.servico)}
                </td>

                <td>
                    ${formatarData(trabalho.data)}
                </td>

                <td>
                    ${dinheiro(trabalho.valorServico)}
                </td>

                <td class="valor-recebido">
                    ${dinheiro(trabalho.totalRecebido)}
                </td>

                <td class="valor-pendente">
                    ${dinheiro(trabalho.pendente)}
                </td>

                <td>
                    <span class="status-badge ${classe}">
                        ${status}
                    </span>
                </td>

            </tr>
        `;

    }).join("");

}


/* =====================================================
   LIMPAR FILTROS
===================================================== */

function limparFiltros() {

    $("pesquisaTrabalho").value = "";
    $("filtroStatus").value = "";
    $("filtroCategoria").value = "";
    $("dataInicial").value = "";
    $("dataFinal").value = "";

    aplicarFiltros();

}


/* =====================================================
   EVENTOS
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    $("pesquisaTrabalho").addEventListener(
        "input",
        aplicarFiltros
    );

    $("filtroStatus").addEventListener(
        "change",
        aplicarFiltros
    );

    $("filtroCategoria").addEventListener(
        "change",
        aplicarFiltros
    );

    $("dataInicial").addEventListener(
        "change",
        aplicarFiltros
    );

    $("dataFinal").addEventListener(
        "change",
        aplicarFiltros
    );

    $("limparFiltros").addEventListener(
        "click",
        limparFiltros
    );

    $("btnAtualizar").addEventListener(
        "click",
        carregarTrabalhos
    );

        $("listaTrabalhos").addEventListener("click", evento => {

        const linha = evento.target.closest("tr[data-id]");

        if (!linha) return;

        const id = linha.dataset.id;

        window.location.href =
            `detalhes.html?id=${encodeURIComponent(id)}`;

    });

    carregarTrabalhos();

});
