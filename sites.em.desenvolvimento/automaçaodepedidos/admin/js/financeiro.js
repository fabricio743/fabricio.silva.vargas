// FINANCEIRO

document.addEventListener("DOMContentLoaded", () => {
    carregarFinanceiro();
});

async function carregarFinanceiro() {
    try {
        const dados = await buscarNaPlanilha("financeiro");

        atualizarFinanceiro(dados);

    } catch (erro) {
        console.error(erro);
    }
}

function formatarMoeda(valor) {
    return "R$ " +
        Number(valor || 0)
            .toFixed(2)
            .replace(".", ",");
}

function atualizarFinanceiro(dados) {
    const financeiroHoje = document.getElementById("financeiroHoje");
    const financeiroSemana = document.getElementById("financeiroSemana");
    const financeiroMes = document.getElementById("financeiroMes");
    const financeiroPedidos = document.getElementById("financeiroPedidos");
    const financeiroPix = document.getElementById("financeiroPix");
    const financeiroDinheiro = document.getElementById("financeiroDinheiro");
    const financeiroCartao = document.getElementById("financeiroCartao");

    if (financeiroHoje) {
        financeiroHoje.innerText =
            formatarMoeda(dados.financeiroHoje);
    }

    if (financeiroSemana) {
        financeiroSemana.innerText =
            formatarMoeda(dados.financeiroSemana);
    }

    if (financeiroMes) {
        financeiroMes.innerText =
            formatarMoeda(dados.financeiroMes);
    }

    if (financeiroPedidos) {
        financeiroPedidos.innerText =
            dados.financeiroPedidos;
    }

    if (financeiroPix) {
        financeiroPix.innerText =
            formatarMoeda(dados.financeiroPix);
    }

    if (financeiroDinheiro) {
        financeiroDinheiro.innerText =
            formatarMoeda(dados.financeiroDinheiro);
    }

    if (financeiroCartao) {
        financeiroCartao.innerText =
            formatarMoeda(dados.financeiroCartao);
    }

    renderizarProdutosMaisVendidos(
        dados.produtosMaisVendidos || []
    );

    renderizarUltimosRecebimentos(
        dados.recebimentos || []
    );
}

function renderizarProdutosMaisVendidos(lista) {
    const container = document.getElementById("produtosMaisVendidos");

    if (!container) return;

    container.innerHTML = "";

    lista.forEach(item => {
        container.innerHTML += `

            <li>
                ${item.produto}
                -
                ${item.quantidade}
                vendidos
            </li>

        `;
    });
}

function renderizarUltimosRecebimentos(lista) {
    const container = document.getElementById("ultimosRecebimentos");

    if (!container) return;

    container.innerHTML = "";

    lista.forEach(item => {
        container.innerHTML += `

            <div class="recebimento">

                ${item.id}
                -
                ${item.cliente}
                -
                ${formatarMoeda(item.total)}
                -
                ${item.pagamento}

            </div>

        `;
    });
}
