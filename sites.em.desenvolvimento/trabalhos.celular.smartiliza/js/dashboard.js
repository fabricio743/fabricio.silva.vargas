const URL_SCRIPT = CONFIG.URL_SCRIPT;

let ordensDashboard = [];

window.addEventListener("load", function(){
    carregarDashboard();

    const filtroMes = document.getElementById("filtroMesDashboard");

    if(filtroMes){
        filtroMes.addEventListener("change", function(){
            montarDashboard(ordensDashboard);
        });
    }
});


async function carregarDashboard(){

    try {

        const resposta = await fetch(URL_SCRIPT + "?action=listarOS");
        const ordens = await resposta.json();

        ordensDashboard = ordens;

        montarDashboard(ordensDashboard);

    } catch(erro){

        console.error("Erro ao carregar dashboard:", erro);

    }

}


function montarDashboard(ordens){

    if(!ordens || !Array.isArray(ordens)){
        return;
    }

    const mesSelecionado = document.getElementById("filtroMesDashboard")
        ? document.getElementById("filtroMesDashboard").value
        : "";

    let ordensFiltradas = ordens;

    if(mesSelecionado){
        ordensFiltradas = ordens.filter(function(os){
            return dataPertenceAoMes(os.data, mesSelecionado);
        });
    }

    let totalAbertas = 0;
    let totalAguardando = 0;
    let totalFinalizadas = 0;
    let totalRetiradas = 0;

    let totalOS = ordensFiltradas.length;
    let faturamento = 0;
    let custos = 0;
    let lucro = 0;

    ordensFiltradas.forEach(function(os){

        const status = normalizarStatus(os.status);

        const orcamento = Number(os.orcamento || 0);
        const custoPeca = Number(os.custoPeca || 0);
        const lucroOS = Number(os.lucro || (orcamento - custoPeca));

        if(status === "em analise"){
            totalAbertas++;
        }

        if(status === "aguardando peca"){
            totalAguardando++;
            totalAbertas++;
        }

        if(status === "finalizado"){
            totalFinalizadas++;
        }

        if(status === "retirado"){
            totalRetiradas++;

            faturamento += orcamento;
            custos += custoPeca;
            lucro += lucroOS;
        }

    });

    preencherTexto("totalAbertas", totalAbertas);
    preencherTexto("totalAguardando", totalAguardando);
    preencherTexto("totalFinalizadas", totalFinalizadas);
    preencherTexto("totalRetiradas", totalRetiradas);

    preencherTexto("dashTotalOS", totalOS);
    preencherTexto("dashFaturamento", formatarMoeda(faturamento));
    preencherTexto("dashCustos", formatarMoeda(custos));
    preencherTexto("dashLucro", formatarMoeda(lucro));

}


function dataPertenceAoMes(data, mesSelecionado){

    if(!data || !mesSelecionado){
        return false;
    }

    let anoMes = "";

    if(typeof data === "string" && data.includes("T")){
        anoMes = data.split("T")[0].slice(0, 7);
    } else if(typeof data === "string" && data.includes("-")){
        anoMes = data.slice(0, 7);
    } else {
        const dataObj = new Date(data);

        if(!isNaN(dataObj)){
            const ano = dataObj.getFullYear();
            const mes = String(dataObj.getMonth() + 1).padStart(2, "0");

            anoMes = ano + "-" + mes;
        }
    }

    return anoMes === mesSelecionado;

}


function preencherTexto(id, valor){

    const elemento = document.getElementById(id);

    if(elemento){
        elemento.textContent = valor;
    }

}


function normalizarStatus(status){

    return String(status || "")
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}


function formatarMoeda(valor){

    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}