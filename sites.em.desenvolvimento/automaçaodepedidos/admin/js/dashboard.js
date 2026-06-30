// DASHBOARD

document.addEventListener("DOMContentLoaded", () => {
    carregarDashboard();
    carregarUltimosPedidos();
    // carregarGraficoPedidos();
});

async function carregarDashboard(){

    try{

        const dados =
        await buscarNaPlanilha("dashboard");

        preencherTexto("pedidosHoje", dados.pedidosHoje);
        preencherTexto("emProducao", dados.emProducao);
        preencherTexto("prontosHoje", dados.prontosHoje);
        preencherTexto("entreguesHoje", dados.entreguesHoje);
        preencherTexto("canceladosHoje", dados.canceladosHoje);
        preencherTexto("produtosAtivos", dados.produtosAtivos);
        preencherTexto("estoqueBaixo", dados.estoqueBaixo);
        preencherTexto("agendasAbertas", dados.agendasAbertas);

        preencherTexto(
            "faturamentoHoje",
            formatarMoedaDashboard(
                dados.faturamentoHoje
            )
        );

        preencherTexto(
            "ticketMedio",
            formatarMoedaDashboard(
                dados.ticketMedio
            )
        );

    }catch(erro){

        console.error(
            "Erro ao carregar dashboard:",
            erro
        );

    }

}

function preencherTexto(id, valor){

    const elemento =
    document.getElementById(id);

    if(elemento){

        elemento.innerText =
        valor ?? 0;

    }

}

function formatarMoedaDashboard(valor){

    return "R$ " +
    Number(valor || 0)
    .toFixed(2)
    .replace(".", ",");

}

async function carregarUltimosPedidos() {
    try {
        const pedidos = await buscarNaPlanilha("ultimosPedidos");

        const container = document.getElementById("ultimosPedidos");

        if (!container) return;

        container.innerHTML = "";

        pedidos.forEach(pedido => {
            container.innerHTML += `

                <div class="pedido">

                    <strong>${pedido.id}</strong>

                    <p>${pedido.cliente}</p>

                    <small>
                        ${pedido.status}
                        •
                        R$ ${pedido.total}
                    </small>

                </div>

            `;
        });

    } catch (erro) {
        console.error(erro);
    }
}

async function carregarGraficoPedidos() {
    try {
        const dados = await buscarNaPlanilha("pedidosUltimos7Dias");

        const labels = Object.keys(dados);
        const valores = Object.values(dados);

        const ctx = document.getElementById("graficoPedidos");

        if (!ctx) return;

        new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Pedidos",
                    data: valores
                }]
            }
        });

    } catch (erro) {
        console.error(erro);
    }
}
