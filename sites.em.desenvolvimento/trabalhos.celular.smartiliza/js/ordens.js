const URL_SCRIPT = CONFIG.URL_SCRIPT;

let ordensCarregadas = [];


window.addEventListener("load", carregarOrdens);


async function carregarOrdens(){

    const lista = document.getElementById("listaOrdens");

    lista.innerHTML = `
        <tr>
            <td colspan="11" class="mensagem-tabela">
                Carregando ordens...
            </td>
        </tr>
    `;

    try {

        const resposta = await fetch(URL_SCRIPT + "?action=listarOS");

        const ordens = await resposta.json();

        ordensCarregadas = ordens;

        mostrarOrdens(ordensCarregadas);

    } catch(erro){

        lista.innerHTML = `
            <tr>
                <td colspan="11" class="mensagem-tabela">
                    Erro ao carregar ordens.
                </td>
            </tr>
        `;

        console.error(erro);

    }

}


function mostrarOrdens(ordens){

    const lista = document.getElementById("listaOrdens");

    if(!ordens || ordens.length === 0){

        lista.innerHTML = `
            <tr>
                <td colspan="11" class="mensagem-tabela">
                    Nenhuma ordem encontrada.
                </td>
            </tr>
        `;

        return;
    }

    lista.innerHTML = "";

    ordens.forEach(function(item){

        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${item.os}</td>
            <td>${formatarData(item.data)}</td>
            <td>${item.cliente}</td>
            <td>${item.telefone}</td>
            <td>${item.modelo}</td>
            <td>R$ ${Number(item.orcamento || 0).toFixed(2)}</td>
            <td>R$ ${Number(item.custoPeca || 0).toFixed(2)}</td>
            <td>R$ ${Number(item.lucro || 0).toFixed(2)}</td>

            <td>
                <select 
                    class="status-select"
                    id="status-${item.linha}"
                >
                    <option ${item.status === "Em análise" ? "selected" : ""}>Em análise</option>
                    <option ${item.status === "Aguardando peça" ? "selected" : ""}>Aguardando peça</option>
                    <option ${item.status === "Finalizado" ? "selected" : ""}>Finalizado</option>
                    <option ${item.status === "Retirado" ? "selected" : ""}>Retirado</option>
                    <option ${item.status === "Sem conserto" ? "selected" : ""}>Sem conserto</option>
                </select>
            </td>

            <td>${item.garantia}</td>

            <td>
                <button 
                    type="button" 
                    class="btn-salvar-status"
                    onclick="salvarStatus(${item.linha})"
                >
                    Salvar
                </button>
            </td>
        `;

        lista.appendChild(linha);

    });

}


function filtrarOrdens(){

    const texto = document
        .getElementById("pesquisaOS")
        .value
        .toLowerCase();

    const status = document
        .getElementById("filtroStatus")
        .value;

    const filtradas = ordensCarregadas.filter(function(item){

        const bateTexto =
            String(item.os).toLowerCase().includes(texto) ||
            String(item.cliente).toLowerCase().includes(texto) ||
            String(item.telefone).toLowerCase().includes(texto) ||
            String(item.modelo).toLowerCase().includes(texto);

        const bateStatus =
            status === "" || item.status === status;

        return bateTexto && bateStatus;

    });

    mostrarOrdens(filtradas);

}


async function salvarStatus(linha){

    const novoStatus = document
        .getElementById("status-" + linha)
        .value;

    const dados = {
        action: "atualizarStatusOS",
        linha: linha,
        status: novoStatus
    };

    try {

        const resposta = await fetch(URL_SCRIPT,{
            method:"POST",
            body:JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if(resultado.sucesso){
            alert("Status atualizado com sucesso!");
            carregarOrdens();
        } else {
            alert("Erro ao atualizar status.");
        }

    } catch(erro){

        alert("Erro ao atualizar status.");
        console.error(erro);

    }

}


function formatarData(data){

    if(!data){
        return "";
    }

    const dataObj = new Date(data);

    if(isNaN(dataObj)){
        return data;
    }

    return dataObj.toLocaleDateString("pt-BR");

}