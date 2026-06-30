// PRODUTOS

let produtos = [];

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("listaProdutos")) {
        carregarProdutos();
    }
});

function abrirModal() {
    document
        .getElementById("modalProduto")
        .classList.add("active");
}

function fecharModal() {
    document
        .getElementById("modalProduto")
        .classList.remove("active");

    limparFormulario();
}

function limparFormulario() {
    document.getElementById("produtoId").value = "";
    document.getElementById("nomeProduto").value = "";
    document.getElementById("descricaoProduto").value = "";
    document.getElementById("precoProduto").value = "";
    document.getElementById("estoqueProduto").value = "";
    document.getElementById("categoriaProduto").value = "";

    const imagemProduto = document.getElementById("imagemProduto");
    const imagemAtualProduto = document.getElementById("imagemAtualProduto");
    const previewImagemProduto = document.getElementById("previewImagemProduto");

    if (imagemProduto) imagemProduto.value = "";
    if (imagemAtualProduto) imagemAtualProduto.value = "";
    if (previewImagemProduto) previewImagemProduto.innerHTML = "";
}

async function carregarProdutos() {
    try {
        produtos = await buscarNaPlanilha("listarProdutos");
        renderizarProdutos();
    } catch (erro) {
        console.error(erro);
        alert("Erro ao carregar produtos.");
    }
}

function renderizarProdutos() {
    const lista = document.getElementById("listaProdutos");

    if (!lista) return;

    lista.innerHTML = "";

    produtos.forEach(produto => {
        lista.innerHTML += `

            <div class="produto-card ${produto.status === "ARQUIVADO" ? "inativo" : ""}">

                <div class="produto-imagem">
                    ${
                        produto.imagem
                        ? `<img src="${produto.imagem}" alt="${produto.nome}">`
                        : "🍗"
                    }
                </div>

                <h3>${produto.nome}</h3>

                <p>R$ ${produto.preco}</p>

                <span>Estoque: ${produto.estoque}</span>

                <span>Categoria: ${produto.categoria}</span>

                <div class="acoes-produto">

                    <button
                        class="editar"
                        onclick="editarProduto('${produto.id}')">
                        Editar
                    </button>

                    <button
                        class="excluir"
                        onclick="alterarStatus('${produto.id}')">
                        ${
                            produto.status === "ATIVO"
                            ? "Arquivar"
                            : "Reativar"
                        }
                    </button>

                </div>

            </div>

        `;
    });
}

function editarProduto(id) {
    const produto = produtos.find(p => String(p.id) === String(id));

    if (!produto) return;

    document.getElementById("produtoId").value = produto.id;
    document.getElementById("nomeProduto").value = produto.nome;
    document.getElementById("descricaoProduto").value = produto.descricao;
    document.getElementById("precoProduto").value = produto.preco;
    document.getElementById("estoqueProduto").value = produto.estoque;
    document.getElementById("categoriaProduto").value = produto.categoria;

    const imagemProduto = document.getElementById("imagemProduto");
    const imagemAtualProduto = document.getElementById("imagemAtualProduto");
    const previewImagemProduto = document.getElementById("previewImagemProduto");

    if (imagemProduto) imagemProduto.value = "";

    if (imagemAtualProduto) {
        imagemAtualProduto.value = produto.imagem || "";
    }

    if (previewImagemProduto) {
        previewImagemProduto.innerHTML =
            produto.imagem
            ? `<img src="${produto.imagem}" alt="${produto.nome}">`
            : "";
    }

    document.getElementById("tituloModal").innerText = "Editar Produto";

    abrirModal();
}

async function alterarStatus(id) {
    const produto = produtos.find(p => String(p.id) === String(id));

    if (!produto) return;

    const novoStatus =
        produto.status === "ATIVO"
        ? "ARQUIVADO"
        : "ATIVO";

    try {
        await enviarParaPlanilha({
            action: "alterarStatus",
            id: id,
            status: novoStatus
        });

        carregarProdutos();

    } catch (erro) {
        console.error(erro);
    }
}
async function salvarProduto() {
    const id = document.getElementById("produtoId").value;

    const inputImagem = document.getElementById("imagemProduto");
    const arquivoImagem = inputImagem ? inputImagem.files[0] : null;

    if (arquivoImagem && arquivoImagem.size > 700 * 1024) {
        alert("Imagem muito grande. Escolha uma imagem com até 700 KB.");
        return;
    }

    let imagemBase64 = "";
    let imagemNome = "";
    let imagemTipo = "";

    if (arquivoImagem) {
        const base64Completo =
            await converterArquivoBase64(arquivoImagem);

        imagemBase64 =
            base64Completo.split(",")[1];

        imagemNome =
            arquivoImagem.name;

        imagemTipo =
            arquivoImagem.type;
    }

    const produto = {
        action: id ? "editarProduto" : "novoProduto",

        id: id,

        nome:
            document.getElementById("nomeProduto").value,

        descricao:
            document.getElementById("descricaoProduto").value,

        preco:
            document.getElementById("precoProduto").value,

        estoque:
            document.getElementById("estoqueProduto").value || 0,

        categoria:
            document.getElementById("categoriaProduto").value,

        imagem:
            document.getElementById("imagemAtualProduto")?.value || "",

        imagemBase64: imagemBase64,
        imagemNome: imagemNome,
        imagemTipo: imagemTipo
    };

    try {
        console.log("Produto enviado:", produto);
        console.log("Tamanho base64:", imagemBase64.length);

        await enviarParaPlanilha(produto);

        fecharModal();

        setTimeout(() => {
            carregarProdutos();
        }, 1000);

    } catch (erro) {
        console.error("Erro ao salvar produto:", erro);
        alert("Erro ao salvar produto.");
    }
}

function novoProduto() {
    limparFormulario();

    document.getElementById("produtoId").value = "";

    document
        .getElementById("tituloModal")
        .innerText = "Novo Produto";

    abrirModal();
}
function converterArquivoBase64(arquivo) {
    return new Promise((resolve, reject) => {
        const leitor = new FileReader();

        leitor.onload = () => {
            resolve(leitor.result);
        };

        leitor.onerror = erro => {
            reject(erro);
        };

        leitor.readAsDataURL(arquivo);
    });
}
window.salvarProduto = salvarProduto;
window.novoProduto = novoProduto;
window.abrirModal = abrirModal;
window.fecharModal = fecharModal;
window.editarProduto = editarProduto;
window.alterarStatus = alterarStatus;