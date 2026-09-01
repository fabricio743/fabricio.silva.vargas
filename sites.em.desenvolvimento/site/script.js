
/* =========================================================
   ESTOQUE DE BATERIAS
   V1 - FUNCIONAMENTO LOCAL

   Nesta primeira etapa os dados ficam no navegador.
   Depois vamos substituir por Google Sheets.
========================================================= */


/* =========================================================
   VARIÁVEIS
========================================================= */

let estoque = [];

let indiceEditando = null;


/* =========================================================
   ELEMENTOS DO HTML
========================================================= */

const modal = document.getElementById("modal");

const btnAdicionar = document.getElementById("btnAdicionar");

const btnAdicionarVazio =
    document.getElementById("btnAdicionarVazio");

const btnFecharModal =
    document.getElementById("btnFecharModal");

const btnCancelar =
    document.getElementById("btnCancelar");

const formBateria =
    document.getElementById("formBateria");

const modalTitulo =
    document.getElementById("modalTitulo");

const listaEstoque =
    document.getElementById("listaEstoque");

const estadoVazio =
    document.getElementById("estadoVazio");

const campoPesquisa =
    document.getElementById("campoPesquisa");

const totalEstoque =
    document.getElementById("totalEstoque");

const totalModelos =
    document.getElementById("totalModelos");


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    carregarEstoque();

    mostrarEstoque();

});


/* =========================================================
   ABRIR MODAL
========================================================= */

function abrirModal() {

    indiceEditando = null;

    modalTitulo.textContent = "Adicionar bateria";

    formBateria.reset();

    modal.classList.add("aberto");

    setTimeout(() => {

        document.getElementById("modelo").focus();

    }, 100);

}


/* =========================================================
   FECHAR MODAL
========================================================= */

function fecharModal() {

    modal.classList.remove("aberto");

    formBateria.reset();

    indiceEditando = null;

}


/* =========================================================
   EVENTOS DOS BOTÕES
========================================================= */

btnAdicionar.addEventListener(
    "click",
    abrirModal
);


btnAdicionarVazio.addEventListener(
    "click",
    abrirModal
);


btnFecharModal.addEventListener(
    "click",
    fecharModal
);


btnCancelar.addEventListener(
    "click",
    fecharModal
);


/* =========================================================
   FECHAR MODAL CLICANDO FORA
========================================================= */

modal.addEventListener("click", (evento) => {

    if (evento.target === modal) {

        fecharModal();

    }

});


/* =========================================================
   FECHAR COM ESC
========================================================= */

document.addEventListener("keydown", (evento) => {

    if (evento.key === "Escape") {

        if (modal.classList.contains("aberto")) {

            fecharModal();

        }

    }

});


/* =========================================================
   SALVAR BATERIA
========================================================= */

formBateria.addEventListener("submit", (evento) => {

    evento.preventDefault();

    salvarBateria();

});


function salvarBateria() {

    const modelo =
        document.getElementById("modelo").value.trim();

    const capacidade =
        document.getElementById("capacidade").value.trim();

    const quantidade =
        Number(
            document.getElementById("quantidade").value
        );

    const custo =
        Number(
            document.getElementById("custo").value
        );

    const observacao =
        document.getElementById("observacao").value.trim();


    /* -----------------------------------------
       VALIDAÇÕES
    ------------------------------------------ */

    if (!modelo) {

        alert("Selecione o modelo do iPhone.");

        return;

    }


    if (!capacidade) {

        alert("Selecione a capacidade da bateria.");

        return;

    }


    if (!Number.isInteger(quantidade) || quantidade < 0) {

        alert("Informe uma quantidade válida.");

        return;

    }


    if (isNaN(custo) || custo < 0) {

        alert("Informe um custo válido.");

        return;

    }


    /* -----------------------------------------
       VERIFICAR DUPLICIDADE
    ------------------------------------------ */

    const duplicado = estoque.findIndex((produto, index) => {

        if (index === indiceEditando) {

            return false;

        }

        return (
            produto.modelo.toLowerCase() === modelo.toLowerCase()
            &&
            produto.capacidade.toLowerCase() === capacidade.toLowerCase()
        );

    });


    if (duplicado !== -1) {

        alert(
            "Já existe uma bateria cadastrada para este modelo e capacidade."
        );

        return;

    }


    /* -----------------------------------------
       EDITAR
    ------------------------------------------ */

    if (indiceEditando !== null) {

        estoque[indiceEditando] = {

            ...estoque[indiceEditando],

            modelo: modelo,

            capacidade: capacidade,

            quantidade: quantidade,

            custo: custo,

            observacao: observacao

        };

    }


    /* -----------------------------------------
       NOVO CADASTRO
    ------------------------------------------ */

    else {

        const novaBateria = {

            id: gerarID(),

            modelo: modelo,

            capacidade: capacidade,

            quantidade: quantidade,

            custo: custo,

            observacao: observacao

        };


        estoque.push(novaBateria);

    }


    /* -----------------------------------------
       SALVAR
    ------------------------------------------ */

    salvarEstoque();

    mostrarEstoque();

    fecharModal();

}


/* =========================================================
   GERAR ID
========================================================= */

function gerarID() {

    return Date.now().toString();

}


/* =========================================================
   MOSTRAR ESTOQUE
========================================================= */

function mostrarEstoque() {

    const pesquisa =
        campoPesquisa.value
            .trim()
            .toLowerCase();


    let produtos = estoque;


    /* -----------------------------------------
       FILTRO
    ------------------------------------------ */

    if (pesquisa) {

        produtos = estoque.filter((produto) => {

            return produto.modelo
                .toLowerCase()
                .includes(pesquisa);

        });

    }


    /* -----------------------------------------
       LIMPAR TABELA
    ------------------------------------------ */

    listaEstoque.innerHTML = "";


    /* -----------------------------------------
       ESTADO VAZIO
    ------------------------------------------ */

    if (produtos.length === 0) {

        estadoVazio.style.display = "flex";

        atualizarResumo();

        return;

    }


    estadoVazio.style.display = "none";


    /* -----------------------------------------
       CRIAR LINHAS
    ------------------------------------------ */

    produtos.forEach((produto) => {

        const linha =
            document.createElement("tr");


        const valorEstoque =
            produto.quantidade * produto.custo;


        linha.innerHTML = `

            <td>
                <strong>
                    ${escaparHTML(produto.modelo)}
                </strong>
            </td>


            <td>
                ${escaparHTML(produto.capacidade)}
            </td>


            <td>
                ${produto.quantidade}
            </td>


            <td>
                ${formatarMoeda(produto.custo)}
            </td>


            <td>
                ${formatarMoeda(valorEstoque)}
            </td>


            <td>

                <div class="acoes">

                    <button
                        class="btn-editar"
                        title="Editar"
                        onclick="editarBateria('${produto.id}')"
                    >
                        ✎
                    </button>


                    <button
                        class="btn-excluir"
                        title="Excluir"
                        onclick="excluirBateria('${produto.id}')"
                    >
                        ×
                    </button>

                </div>

            </td>

        `;


        listaEstoque.appendChild(linha);

    });


    atualizarResumo();

}


/* =========================================================
   ATUALIZAR RESUMO
========================================================= */

function atualizarResumo() {

    /* -----------------------------------------
       QUANTIDADE TOTAL
    ------------------------------------------ */

    const quantidadeTotal =
        estoque.reduce(
            (total, produto) => {

                return total + produto.quantidade;

            },
            0
        );


    totalEstoque.textContent =
        quantidadeTotal;


    /* -----------------------------------------
       MODELOS CADASTRADOS
    ------------------------------------------ */

    const modelos =
        new Set(
            estoque.map(
                produto => produto.modelo
            )
        );


    totalModelos.textContent =
        modelos.size;

}


/* =========================================================
   EDITAR BATERIA
========================================================= */

function editarBateria(id) {

    const indice =
        estoque.findIndex(
            produto => produto.id === id
        );


    if (indice === -1) {

        return;

    }


    const produto =
        estoque[indice];


    indiceEditando = indice;


    modalTitulo.textContent =
        "Editar bateria";


    document.getElementById("modelo").value =
        produto.modelo;


    document.getElementById("capacidade").value =
        produto.capacidade;


    document.getElementById("quantidade").value =
        produto.quantidade;


    document.getElementById("custo").value =
        produto.custo;


    document.getElementById("observacao").value =
        produto.observacao || "";


    modal.classList.add("aberto");

}


/* =========================================================
   EXCLUIR BATERIA
========================================================= */

function excluirBateria(id) {

    const indice =
        estoque.findIndex(
            produto => produto.id === id
        );


    if (indice === -1) {

        return;

    }


    const produto =
        estoque[indice];


    const confirmar =
        confirm(
            `Deseja realmente excluir a bateria ${produto.modelo}?`
        );


    if (!confirmar) {

        return;

    }


    estoque.splice(indice, 1);


    salvarEstoque();

    mostrarEstoque();

}


/* =========================================================
   PESQUISA
========================================================= */

campoPesquisa.addEventListener(
    "input",
    mostrarEstoque
);


/* =========================================================
   LOCAL STORAGE
=========================================================

   Temporariamente usamos o armazenamento
   do navegador.

   Depois será substituído pelo Google Sheets.
========================================================= */

function salvarEstoque() {

    localStorage.setItem(
        "estoqueBaterias",
        JSON.stringify(estoque)
    );

}


function carregarEstoque() {

    const dados =
        localStorage.getItem(
            "estoqueBaterias"
        );


    if (!dados) {

        estoque = [];

        return;

    }


    try {

        estoque =
            JSON.parse(dados);


        if (!Array.isArray(estoque)) {

            estoque = [];

        }

    }

    catch (erro) {

        console.error(
            "Erro ao carregar estoque:",
            erro
        );

        estoque = [];

    }

}


/* =========================================================
   FORMATAÇÃO DE MOEDA
========================================================= */

function formatarMoeda(valor) {

    return new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    ).format(valor);

}


/* =========================================================
   SEGURANÇA
=========================================================

   Evita inserir HTML diretamente
   vindo dos dados cadastrados.
========================================================= */

function escaparHTML(valor) {

    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

