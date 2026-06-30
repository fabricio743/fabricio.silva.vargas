// ESTOQUE

document.addEventListener("DOMContentLoaded", () => {
    carregarEstoque();
});

async function carregarEstoque() {
    try {
        const produtos = await buscarNaPlanilha("listarProdutos");

        renderizarEstoque(produtos);

    } catch (erro) {
        console.error(erro);
    }
}

function renderizarEstoque(produtos) {
    const container = document.getElementById("listaEstoque");

    if (!container) return;

    container.innerHTML = "";

    produtos.forEach(produto => {
        if (produto.status !== "ATIVO") return;

        const estoque = Number(produto.estoque) || 0;
        const minimo = 10;

        const percentual = Math.min(
            (estoque / minimo) * 100,
            100
        );

        const estoqueBaixo = estoque <= minimo;

        container.innerHTML += `

            <div class="estoque-card">

                <h3>🍖 ${produto.nome}</h3>

                <h1>${estoque}</h1>

                <span>Estoque Atual</span>

                <div class="barra">

                    <div
                        class="${estoqueBaixo ? "progresso-baixo" : "progresso"}"
                        style="width:${percentual}%">
                    </div>

                </div>

                <p>Mínimo: ${minimo}</p>

                <div class="${estoqueBaixo ? "status-baixo" : "status-ok"}">

                    ${
                        estoqueBaixo
                        ? "🔴 Estoque Baixo"
                        : "🟢 Estoque Normal"
                    }

                </div>

                <div class="acoes">

                    <button onclick="ajustarEstoque('${produto.id}', -1)">
                        -
                    </button>

                    <button onclick="ajustarEstoque('${produto.id}', 1)">
                        +
                    </button>

                </div>

            </div>

        `;
    });
}

async function ajustarEstoque(id, valor) {
    try {
        await enviarParaPlanilha({
            action: "ajustarEstoque",
            id: id,
            valor: valor
        });

        carregarEstoque();

    } catch (erro) {
        console.error(erro);
    }
}
