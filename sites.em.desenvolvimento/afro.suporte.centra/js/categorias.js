
/* =====================================================
   GESTÃO DE CATEGORIAS
===================================================== */

let categorias = [];


/* =====================================================
   ELEMENTOS E FUNÇÕES AUXILIARES
===================================================== */

const formularioCategoria = document.getElementById("formularioCategoria");
const campoNomeCategoria = document.getElementById("nomeCategoria");
const corpoCategorias = document.getElementById("corpoCategorias");

function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[caractere]);
}


/* =====================================================
   CARREGAR CATEGORIAS
===================================================== */

async function carregarCategorias() {

    try {

        corpoCategorias.innerHTML = `
            <tr>
                <td colspan="3">Carregando categorias...</td>
            </tr>
        `;

        const resposta = await apiGet("listarCategorias");

        if (!resposta || !resposta.sucesso) {
            throw new Error(resposta?.mensagem || "Erro ao carregar categorias.");
        }

        categorias = resposta.categorias || [];

        renderizarCategorias();

    } catch (erro) {

        console.error("Erro ao carregar categorias:", erro);

        corpoCategorias.innerHTML = `
            <tr>
                <td colspan="3">Não foi possível carregar as categorias.</td>
            </tr>
        `;

    }

}


/* =====================================================
   RENDERIZAR CATEGORIAS
===================================================== */

function renderizarCategorias() {

    const ativas = categorias.filter(categoria => categoria.ativa);
    const inativas = categorias.filter(categoria => !categoria.ativa);

    document.getElementById("totalCategorias").textContent = categorias.length;
    document.getElementById("categoriasAtivas").textContent = ativas.length;
    document.getElementById("categoriasInativas").textContent = inativas.length;

    document.getElementById("quantidadeCategorias").textContent =
        `${categorias.length} categorias`;

    if (categorias.length === 0) {

        corpoCategorias.innerHTML = `
            <tr>
                <td colspan="3">Nenhuma categoria cadastrada.</td>
            </tr>
        `;

        return;
    }

    corpoCategorias.innerHTML = categorias.map(categoria => {

        const status = categoria.ativa
            ? `<span style="color: var(--green);">Ativa</span>`
            : `<span style="color: var(--muted);">Inativa</span>`;

        const textoBotao = categoria.ativa
            ? "Desativar"
            : "Ativar";

        return `
            <tr>
                <td>${escaparHTML(categoria.nome)}</td>

                <td>${status}</td>

                <td>
                    <button
                        type="button"
                        class="btn-secondary"
                        data-acao="editar"
                        data-id="${escaparHTML(categoria.id)}">
                        Editar
                    </button>

                    <button
                        type="button"
                        class="btn-secondary"
                        data-acao="status"
                        data-id="${escaparHTML(categoria.id)}">
                        ${textoBotao}
                    </button>
                </td>
            </tr>
        `;

    }).join("");

}


/* =====================================================
   ADICIONAR CATEGORIA
===================================================== */

formularioCategoria.addEventListener("submit", async (evento) => {

    evento.preventDefault();

    const nome = campoNomeCategoria.value.trim();

    if (!nome) {
        alert("Informe o nome da categoria.");
        return;
    }

    const botao = formularioCategoria.querySelector('button[type="submit"]');

    try {

        botao.disabled = true;
        botao.textContent = "Salvando...";

        const resposta = await apiPost("adicionarCategoria", {
            nome: nome
        });

        if (!resposta.sucesso) {
            throw new Error(resposta.mensagem || "Não foi possível adicionar a categoria.");
        }

        formularioCategoria.reset();

        await carregarCategorias();

        alert("Categoria adicionada com sucesso!");

    } catch (erro) {

        console.error("Erro ao adicionar categoria:", erro);
        alert(erro.message);

    } finally {

        botao.disabled = false;
        botao.textContent = "+ Adicionar categoria";

    }

});


/* =====================================================
   EDITAR CATEGORIA
===================================================== */

async function editarCategoria(id) {

    const categoria = categorias.find(item => String(item.id) === String(id));

    if (!categoria) return;

    const novoNome = prompt(
        "Digite o novo nome da categoria:",
        categoria.nome
    );

    if (novoNome === null) return;

    const nome = novoNome.trim();

    if (!nome) {
        alert("O nome da categoria não pode ficar vazio.");
        return;
    }

    try {

        const resposta = await apiPost("editarCategoria", {
            id: categoria.id,
            nome: nome
        });

        if (!resposta.sucesso) {
            throw new Error(resposta.mensagem || "Não foi possível editar a categoria.");
        }

        await carregarCategorias();

        alert("Categoria atualizada com sucesso!");

    } catch (erro) {

        console.error("Erro ao editar categoria:", erro);
        alert(erro.message);

    }

}


/* =====================================================
   ATIVAR / DESATIVAR CATEGORIA
===================================================== */

async function alterarStatusCategoria(id) {

    const categoria = categorias.find(item => String(item.id) === String(id));

    if (!categoria) return;

    const novoStatus = !categoria.ativa;

    const confirmacao = confirm(
        novoStatus
            ? `Deseja ativar a categoria "${categoria.nome}"?`
            : `Deseja desativar a categoria "${categoria.nome}"?`
    );

    if (!confirmacao) return;

    try {

        const resposta = await apiPost("alterarStatusCategoria", {
            id: categoria.id,
            ativa: novoStatus
        });

        if (!resposta.sucesso) {
            throw new Error(resposta.mensagem || "Não foi possível alterar o status.");
        }

        await carregarCategorias();

    } catch (erro) {

        console.error("Erro ao alterar status:", erro);
        alert(erro.message);

    }

}


/* =====================================================
   EVENTOS DA TABELA
===================================================== */

corpoCategorias.addEventListener("click", evento => {

    const botao = evento.target.closest("button[data-acao]");

    if (!botao) return;

    const id = botao.dataset.id;
    const acao = botao.dataset.acao;

    if (acao === "editar") {
        editarCategoria(id);
    }

    if (acao === "status") {
        alterarStatusCategoria(id);
    }

});


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

document.addEventListener("DOMContentLoaded", carregarCategorias);
