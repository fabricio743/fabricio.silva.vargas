/* =========================================================
   ESTOQUE DE BATERIAS
   V1 — GOOGLE SHEETS
========================================================= */


/* =========================================================
   CONFIGURAÇÃO
========================================================= */

const URL_SCRIPT = CONFIG.URL_SCRIPT

const CHAVE_CACHE_ESTOQUE = "estoque_baterias_cache";

/* =========================================================
   VARIÁVEIS
========================================================= */

let estoque = [];

let indiceEditando = null;

let modoReposicao = false;

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

const btnAtualizar = document.getElementById("btnAtualizar");

/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    inicializarEstoque
);


/* =========================================================
   CARREGAR ESTOQUE
========================================================= */
function inicializarEstoque() {

    try {

        const cache =
            localStorage.getItem(
                CHAVE_CACHE_ESTOQUE
            );


        if (cache) {

            const dadosCache =
                JSON.parse(cache);


            if (
                Array.isArray(dadosCache)
            ) {

                estoque =
                    dadosCache;

                mostrarEstoque();

            }

        }

    } catch (erro) {

        console.warn(
            "Não foi possível carregar o cache:",
            erro
        );

    }


    /*
     * Busca os dados atuais
     * sem bloquear a interface.
     */

    carregarEstoque(
        !estoque.length
    );

}

async function carregarEstoque(
    mostrarLoading = true
) {

    try {

        if (mostrarLoading && estoque.length === 0) {
            mostrarCarregando();
        }


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

                /*
                * Guarda uma cópia local
                * para a próxima abertura.
                */

                try {

                    localStorage.setItem(
                        CHAVE_CACHE_ESTOQUE,
                        JSON.stringify(estoque)
                    );

                } catch (erro) {

                    console.warn(
                        "Não foi possível salvar o cache:",
                        erro
                    );

                }
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

            <td colspan="7"
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

            <td colspan="7"
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

    modoReposicao = false;

    modalTitulo.textContent =
        "Adicionar bateria";

    formBateria
        .querySelector('button[type="submit"]')
        .textContent =
        "Salvar bateria";

    formBateria.reset();

    document.getElementById("modelo").disabled = false;
    document.getElementById("marca").disabled = false;
    document.getElementById("capacidade").disabled = false;

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

    modoReposicao = false;

    document.getElementById("modelo").disabled = false;
    document.getElementById("marca").disabled = false;
    document.getElementById("capacidade").disabled = false;

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

btnAtualizar.addEventListener("click", async () => {
    btnAtualizar.disabled = true;
    btnAtualizar.innerHTML = "⏳ Atualizando...";

    try {
        await carregarEstoque();
    } catch (erro) {
        console.error("Erro ao atualizar estoque:", erro);
    } finally {
        btnAtualizar.disabled = false;
        btnAtualizar.innerHTML = "🔄 Atualizar";
    }
});


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

    const marca =
        document
            .getElementById("marca")
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
   REPOSIÇÃO DE ESTOQUE
------------------------------------------ */

if (modoReposicao) {

    if (
        !Number.isInteger(quantidade)
        ||
        quantidade <= 0
    ) {

        alert(
            "Informe uma quantidade válida para reposição."
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


    const dados = {

        acao:
            "reporEstoque",

        id:
            estoque[indiceEditando].id,

        quantidade:
            quantidade,

        custo:
            custo,

        observacao:
            observacao

    };


    const botaoSalvar =
        formBateria.querySelector(
            'button[type="submit"]'
        );


    botaoSalvar.disabled = true;

    botaoSalvar.textContent =
        "Salvando...";


    try {

        // Envia para o Google Sheets
        enviarDados(dados)
            .then(resultado => {

                if (!resultado.sucesso) {

                    console.error(
                        "Erro ao salvar:",
                        resultado.mensagem
                    );

                    return;

                }

                // Atualiza o estoque quando o servidor responder
                carregarEstoque();

            })
            .catch(erro => {

                console.error(
                    "Erro ao salvar:",
                    erro
                );

                // Mesmo se a resposta falhar,
                // o Google pode já ter gravado.
                carregarEstoque();

            });


        // Fecha imediatamente a janela
        fecharModal();


    }
    finally {

        botaoSalvar.disabled = false;

        botaoSalvar.textContent =
            "Salvar bateria";

    }

    return;

}
    /* -----------------------------------------
       VALIDAÇÕES
    ------------------------------------------ */

    if (!modelo) {

        alert(
            "Selecione o modelo do iPhone."
        );

        return;

    }

    if (!marca) {

        alert(
            "Informe a marca da bateria."
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

        marca:
            marca,    

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


    // Verifica se o estoque foi atualizado mesmo
    try {

        await carregarEstoque();


        const foiSalvo =
            estoque.some(produto => {

                return (
                    produto.modelo === modelo &&
                    produto.marca === marca &&
                    produto.capacidade === capacidade &&
                    Number(produto.quantidade) === quantidade &&
                    Number(produto.custo) === custo
                );

            });


        if (foiSalvo) {

            fecharModal();

            alert(
                "Bateria adicionada com sucesso."
            );

            return;

        }

    } catch (erroVerificacao) {

        console.error(
            "Erro ao verificar estoque:",
            erroVerificacao
        );

    }


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

                ${escaparHTML(produto.marca || "-")}

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
                        class="btn-repor"
                        title="Adicionar novo estoque"
                    >
                        +
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

        
        linha
            .querySelector(".btn-repor")
            .addEventListener(
                "click",
                () => abrirModalReposicao(produto.id)
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
   ADICIONAR NOVO ESTOQUE
========================================================= */

function abrirModalReposicao(id) {

    const produto =
        estoque.find(
            item =>
                String(item.id)
                ===
                String(id)
        );


    if (!produto) {

        alert(
            "Bateria não encontrada."
        );

        return;

    }


    indiceEditando =
        estoque.findIndex(
            item =>
                String(item.id)
                ===
                String(id)
        );


    modoReposicao = true;


    modalTitulo.textContent =
        "Adicionar novo estoque";

    formBateria
        .querySelector('button[type="submit"]')
        .textContent =
        "Adicionar estoque";    

    document
        .getElementById("modelo")
        .value =
        produto.modelo;


    document
        .getElementById("marca")
        .value =
        produto.marca || "";


    document
        .getElementById("capacidade")
        .value =
        produto.capacidade;


    document
        .getElementById("quantidade")
        .value =
        "";


    document
        .getElementById("custo")
        .value =
        "";


    document
        .getElementById("observacao")
        .value =
        "";


    document.getElementById("modelo").disabled = true;
    document.getElementById("marca").disabled = true;
    document.getElementById("capacidade").disabled = true;


    modal.classList.add("aberto");


    setTimeout(() => {

        document
            .getElementById("quantidade")
            .focus();

    }, 100);

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

    formBateria
        .querySelector('button[type="submit"]')
        .textContent =
        "Salvar alterações";

    document
        .getElementById("modelo")
        .value =
        produto.modelo;

    document
        .getElementById("marca")
        .value =
        produto.marca || "";   

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