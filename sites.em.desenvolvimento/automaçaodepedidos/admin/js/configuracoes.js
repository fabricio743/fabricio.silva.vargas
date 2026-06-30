// CONFIGURAÇÕES

document.addEventListener("DOMContentLoaded", () => {
    carregarConfiguracoes();
});

async function carregarConfiguracoes() {
    try {
        const dados = await buscarNaPlanilha("listarConfiguracoes");

        preencherConfiguracoes(dados);

    } catch (erro) {
        console.error(erro);
    }
}

function preencherConfiguracoes(dados) {
    const campos = {
        configNomeEmpresa: "nomeEmpresa",
        configWhatsapp: "whatsapp",
        configTaxaEntrega: "taxaEntrega",
        configPedidoMinimo: "pedidoMinimo",
        configPixNome: "pixNome",
        configPixChave: "pixChave",
        configPixTipo: "pixTipo",
        configStatusLoja: "statusLoja",
        configMaxPedidosHorario: "maxPedidosHorario",
        configTempoHorarios: "tempoHorarios",
        configMensagemConfirmacao: "mensagemConfirmacao"
    };

    Object.keys(campos).forEach(id => {
        const elemento = document.getElementById(id);

        if (elemento) {
            elemento.value = dados[campos[id]] || "";
        }
    });
}

async function salvarConfiguracoes() {
    try {
        await enviarParaPlanilha({
            action: "salvarConfiguracoes",

            nomeEmpresa:
                document.getElementById("configNomeEmpresa").value,

            whatsapp:
                document.getElementById("configWhatsapp").value,

            taxaEntrega:
                document.getElementById("configTaxaEntrega").value,

            pedidoMinimo:
                document.getElementById("configPedidoMinimo").value,

            pixNome:
                document.getElementById("configPixNome").value,

            pixChave:
                document.getElementById("configPixChave").value,

            pixTipo:
                document.getElementById("configPixTipo").value,

            statusLoja:
                document.getElementById("configStatusLoja").value,

            maxPedidosHorario:
                document.getElementById("configMaxPedidosHorario").value,

            tempoHorarios:
                document.getElementById("configTempoHorarios").value,

            mensagemConfirmacao:
                document.getElementById("configMensagemConfirmacao").value
        });

        alert("Configurações salvas com sucesso!");

    } catch (erro) {
        console.error(erro);
        alert("Erro ao salvar configurações.");
    }
}
