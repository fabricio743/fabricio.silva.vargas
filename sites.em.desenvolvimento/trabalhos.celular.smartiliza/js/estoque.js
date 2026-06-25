const URL_SCRIPT = CONFIG.URL_SCRIPT;

let pecasCarregadas = [];

document
.getElementById("pecaForm")
.addEventListener("submit", async function(e){

    e.preventDefault();

    const id = document.getElementById("pecaId").value;

    const dados = {
        action: id ? "editarPeca" : "novaPeca",

        id: id,
        marca: document.getElementById("marcaPeca").value,
        modelo: document.getElementById("modeloPeca").value,
        peca: document.getElementById("nomePeca").value,
        quantidade: document.getElementById("quantidadePeca").value,
        custoUnitario: document.getElementById("custoUnitarioPeca").value,
        fornecedor: document.getElementById("fornecedorPeca").value,
        status: document.getElementById("statusPeca").value,
        observacao: document.getElementById("observacaoPeca").value
    };

    try {

        const resposta = await fetch(URL_SCRIPT,{
            method:"POST",
            body:JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if(resultado.sucesso){
            alert("Peça salva com sucesso!");
            document.getElementById("pecaForm").reset();
            carregarPecas();
        } else {
            alert("Erro ao salvar peça.");
        }

    } catch(erro){

        alert("Erro ao salvar peça.");
        console.error(erro);

    }

});


async function carregarPecas(){

    const lista = document.getElementById("listaPecas");

    lista.innerHTML = `
        <tr>
            <td colspan="8" class="mensagem-tabela">
                Carregando peças...
            </td>
        </tr>
    `;

    try {

        const resposta = await fetch(URL_SCRIPT + "?action=listarPecas");

        const pecas = await resposta.json();

        pecasCarregadas = pecas;

        if(!pecas || pecas.length === 0){

            lista.innerHTML = `
                <tr>
                    <td colspan="8" class="mensagem-tabela">
                        Nenhuma peça cadastrada.
                    </td>
                </tr>
            `;

            return;
        }

        lista.innerHTML = "";

        pecas.forEach(function(item){

            const linha = document.createElement("tr");

            linha.innerHTML = `
                <td>${item.marca}</td>
                <td>${item.modelo}</td>
                <td>${item.peca}</td>
                <td>${item.quantidade}</td>
                <td>R$ ${Number(item.custoUnitario || 0).toFixed(2)}</td>
                <td>${item.fornecedor}</td>
                <td>${item.status}</td>
                <td>
                    <button 
                        type="button" 
                        class="btn-tabela"
                        onclick="editarPeca('${item.id}')"
                    >
                        Editar
                    </button>
                </td>
            `;

            lista.appendChild(linha);

        });

    } catch(erro){

        lista.innerHTML = `
            <tr>
                <td colspan="8" class="mensagem-tabela">
                    Erro ao carregar peças.
                </td>
            </tr>
        `;

        console.error(erro);

    }

}


function editarPeca(id){

    const peca = pecasCarregadas.find(function(item){
        return String(item.id) === String(id);
    });

    if(!peca){
        alert("Peça não encontrada.");
        return;
    }

    document.getElementById("pecaId").value = peca.id;
    document.getElementById("marcaPeca").value = peca.marca;
    document.getElementById("modeloPeca").value = peca.modelo;
    document.getElementById("nomePeca").value = peca.peca;
    document.getElementById("quantidadePeca").value = peca.quantidade;
    document.getElementById("custoUnitarioPeca").value = peca.custoUnitario;
    document.getElementById("fornecedorPeca").value = peca.fornecedor;
    document.getElementById("statusPeca").value = peca.status;
    document.getElementById("observacaoPeca").value = peca.observacao;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


window.addEventListener("load", carregarPecas);