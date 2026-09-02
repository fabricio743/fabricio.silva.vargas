/* =========================================================
   ESTOQUE DE BATERIAS
   V1 — GOOGLE SHEETS
========================================================= */


/* =========================================================
   CONFIGURAÇÃO
========================================================= */

const URL_SCRIPT =
    "https://script.google.com/macros/s/AKfycbwYtirtEpFjtr9FFd7IGontgsc1HlRs6es0VEFQjefYK5c5lPsjLaPdi3SI90gRR6qz/exec";


/* =========================================================
   VARIÁVEIS
========================================================= */

let estoque = [];

let indiceEditando = null;


/* =========================================================
   ELEMENTOS
========================================================= */

const modal =
    document.getElementById("modal");

const btnAdicionar =
    document.getElementById("btnAdicionar");

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

document.addEventListener(
    "DOMContentLoaded",
    carregarEstoque
);


/* =========================================================
   CARREGAR ESTOQUE
========================================================= */

async function carregarEstoque() {

    try {

        mostrarCarregando();


        const resposta =
            await fetch(
                `${URL_SCRIPT}?acao=listarEstoque`
            );


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível conectar ao servidor."
            );

        }


        const dados =
            await resposta.json();


        if (!dados.sucesso) {

            throw new Error(
                dados.mensagem ||
                "Erro ao carregar estoque."
            );

        }


        estoque =
            dados.estoque || [];


        mostrarEstoque();


    }

    catch (erro) {

        console.error(
            "Erro ao carregar estoque:",
            erro
        );


        mostrarErro(
            "Não foi possível carregar o estoque."
        );

    }

}


/* =========================================================
   ESTADO DE CARREGAMENTO
========================================================= */

function mostrarCarregando() {

    listaEstoque.innerHTML = `

        <tr>

            <td colspan="6"
                style="text-align:center;padding:30px;">

                Carregando estoque...

            </td>

        </tr>

    `;

}


/* =========================================================
   MOSTRAR ERRO
========================================================= */

function mostrarErro(mensagem) {

    listaEstoque.innerHTML = `

        <tr>

            <td colspan="6"
                style="text-align:center;padding:30px;">

                ${escaparHTML(mensagem)}

                <br><br>

                <button
                    class="btn-primary"
                    onclick="carregarEstoque()"
                >
                    Tentar novamente
                </button>

            </td>

        </tr>

    `;

}


/* =========================================================
   ABRIR MODAL
========================================================= */

function abrirModal() {

    indiceEditando = null;

    modalTitulo.textContent =
        "Adicionar bateria";

    formBateria.reset();

    modal.classList.add("aberto");


    setTimeout(() => {

        document
            .getElementById("modelo")
            .focus();

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
   EVENTOS
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


modal.addEventListener(
    "click",
    evento => {

        if (
            evento.target === modal
        ) {

            fecharModal();

        }

    }
);


document.addEventListener(
    "keydown",
    evento => {

        if (
            evento.key === "Escape"
            &&
            modal.classList.contains("aberto")
        ) {

            fecharModal();

        }

    }
);


/* =========================================================
   SALVAR
========================================================= */

formBateria.addEventListener(
    "submit",
    salvarBateria
);


async function salvarBateria(evento) {

    evento.preventDefault();


    const modelo =
        document
            .getElementById("modelo")
            .value
            .trim();


    const capacidade =
        document
            .getElementById("capacidade")
            .value
            .trim();


    const quantidade =
        Number(
            document
                .getElementById("quantidade")
                .value
        );


    const custo =
        Number(
            document
                .getElementById("custo")
                .value
        );


    const observacao =
        document
            .getElementById("observacao")
            .value
            .trim();


    /* -----------------------------------------
       VALIDAÇÕES
    ------------------------------------------ */

    if (!modelo) {

        alert(
            "Selecione o modelo do iPhone."
        );

        return;

    }


    if (!capacidade) {

        alert(
            "Selecione a capacidade da bateria."
        );

        return;

    }


    if (
        !Number.isInteger(quantidade)
        ||
        quantidade < 0
    ) {

        alert(
            "Informe uma quantidade válida."
        );

        return;

    }


    if (
        isNaN(custo)
        ||
        custo < 0
    ) {

        alert(
            "Informe um custo válido."
        );

        return;

    }


    /* -----------------------------------------
       PREPARAR DADOS
    ------------------------------------------ */

    const dados = {

        acao:
            indiceEditando === null
                ? "adicionarBateria"
                : "editarBateria",

        modelo:
            modelo,

        capacidade:
            capacidade,

        quantidade:
            quantidade,

        custo:
            custo,

        observacao:
            observacao

    };


    if (indiceEditando !== null) {

        dados.id =
            estoque[indiceEditando].id;

    }


    /* -----------------------------------------
       DESABILITAR BOTÃO
    ------------------------------------------ */

    const botaoSalvar =
        formBateria.querySelector(
            'button[type="submit"]'
        );


    botaoSalvar.disabled = true;

    botaoSalvar.textContent =
        "Salvando...";


    try {

        const resultado =
            await enviarDados(dados);


        if (!resultado.sucesso) {

            throw new Error(
                resultado.mensagem ||
                "Não foi possível salvar."
            );

        }


        fecharModal();


        await carregarEstoque();


    }

    catch (erro) {

        console.error(
            "Erro ao salvar:",
            erro
        );


        alert(
            erro.message ||
            "Erro ao salvar bateria."
        );

    }

    finally {

        botaoSalvar.disabled = false;

        botaoSalvar.textContent =
            "Salvar bateria";

    }

}


/* =========================================================
   ENVIAR DADOS PARA O APPS SCRIPT
========================================================= */

async function enviarDados(dados) {

    const formulario =
        new URLSearchParams();


    Object.keys(dados).forEach(chave => {

        formulario.append(
            chave,
            dados[chave]
        );

    });


    const resposta =
        await fetch(
            URL_SCRIPT,
            {

                method: "POST",

                body: formulario

            }
        );


    if (!resposta.ok) {

        throw new Error(
            "Erro de comunicação com o servidor."
        );

    }


    return await resposta.json();

}


/* =========================================================
   MOSTRAR ESTOQUE
========================================================= */

function mostrarEstoque() {

    const pesquisa =
        campoPesquisa
            .value
            .trim()
            .toLowerCase();


    let produtos =
        estoque;


    if (pesquisa) {

        produtos =
            estoque.filter(produto => {

                return produto.modelo
                    .toLowerCase()
                    .includes(pesquisa);

            });

    }


    listaEstoque.innerHTML = "";


    if (produtos.length === 0) {

        estadoVazio.style.display =
            "flex";

        atualizarResumo();

        return;

    }


    estadoVazio.style.display =
        "none";


    produtos.forEach(produto => {

        const linha =
            document.createElement("tr");


        const valorEstoque =
            produto.quantidade *
            produto.custo;


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
                    >
                        ✎
                    </button>


                    <button
                        class="btn-excluir"
                        title="Excluir"
                    >
                        ×
                    </button>

                </div>

            </td>

        `;


        /* -----------------------------------------
           EVENTO EDITAR
        ------------------------------------------ */

        linha
            .querySelector(".btn-editar")
            .addEventListener(
                "click",
                () => editarBateria(produto.id)
            );


        /* -----------------------------------------
           EVENTO EXCLUIR
        ------------------------------------------ */

        linha
            .querySelector(".btn-excluir")
            .addEventListener(
                "click",
                () => excluirBateria(produto.id)
            );


        listaEstoque.appendChild(linha);

    });


    atualizarResumo();

}


/* =========================================================
   RESUMO
========================================================= */

function atualizarResumo() {

    const quantidadeTotal =
        estoque.reduce(
            (total, produto) => {

                return total +
                    Number(produto.quantidade || 0);

            },
            0
        );


    totalEstoque.textContent =
        quantidadeTotal;


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
   EDITAR
========================================================= */

function editarBateria(id) {

    const indice =
        estoque.findIndex(
            produto =>
                String(produto.id)
                ===
                String(id)
        );


    if (indice === -1) {

        alert(
            "Bateria não encontrada."
        );

        return;

    }


    const produto =
        estoque[indice];


    indiceEditando =
        indice;


    modalTitulo.textContent =
        "Editar bateria";


    document
        .getElementById("modelo")
        .value =
        produto.modelo;


    document
        .getElementById("capacidade")
        .value =
        produto.capacidade;


    document
        .getElementById("quantidade")
        .value =
        produto.quantidade;


    document
        .getElementById("custo")
        .value =
        produto.custo;


    document
        .getElementById("observacao")
        .value =
        produto.observacao || "";


    modal.classList.add("aberto");

}


/* =========================================================
   EXCLUIR
========================================================= */

async function excluirBateria(id) {

    const produto =
        estoque.find(
            item =>
                String(item.id)
                ===
                String(id)
        );


    if (!produto) {

        return;

    }


    const confirmar =
        confirm(
            `Deseja realmente excluir ${produto.modelo}?`
        );


    if (!confirmar) {

        return;

    }


    try {

        const resultado =
            await enviarDados({

                acao:
                    "excluirBateria",

                id:
                    id

            });


        if (!resultado.sucesso) {

            throw new Error(
                resultado.mensagem ||
                "Não foi possível excluir."
            );

        }


        await carregarEstoque();


    }

    catch (erro) {

        console.error(
            "Erro ao excluir:",
            erro
        );


        alert(
            erro.message ||
            "Erro ao excluir bateria."
        );

    }

}


/* =========================================================
   PESQUISA
========================================================= */

campoPesquisa.addEventListener(
    "input",
    mostrarEstoque
);


/* =========================================================
   MOEDA
========================================================= */

function formatarMoeda(valor) {

    return new Intl.NumberFormat(
        "pt-BR",
        {

            style: "currency",

            currency: "BRL"

        }
    ).format(
        Number(valor) || 0
    );

}


/* =========================================================
   SEGURANÇA
========================================================= */

function escaparHTML(valor) {

    return String(valor)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}