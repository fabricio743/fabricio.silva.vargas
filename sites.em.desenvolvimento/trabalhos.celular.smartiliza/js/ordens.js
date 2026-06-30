const URL_SCRIPT = CONFIG.URL_SCRIPT;

let ordensCarregadas = [];
let ordemSelecionadaPDF = null;


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
                <td colspan="14" class="mensagem-tabela">
                    Nenhuma ordem encontrada.
                </td>
            </tr>
        `;

        return;
    }

    lista.innerHTML = "";

    ordens.forEach(function(item){
    const linha = document.createElement("tr");

    const classe = classeStatus(item.status);

    if(classe){
        linha.classList.add(classe);
    }

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
                    onchange="salvarStatus(${item.linha})"
                >
                    <option ${item.status === "Em análise" ? "selected" : ""}>Em análise</option>
                    <option ${item.status === "Aguardando peça" ? "selected" : ""}>Aguardando peça</option>
                    <option ${item.status === "Finalizado" ? "selected" : ""}>Finalizado</option>
                    <option ${item.status === "Retirado" ? "selected" : ""}>Retirado</option>
                    <option ${
                        item.status === "Sem conserto" || item.status === "Sem concerto" 
                        ? "selected" 
                        : ""
                    }>
                        Sem conserto
                    </option>
                </select>
            </td>

            <td>${formatarData(item.garantia)}</td>

                <td>
                    <button 
                        type="button" 
                        class="btn-tabela"
                        onclick="abrirDetalhesOS(${item.linha})"
                    >
                        Ver
                    </button>
                </td>

                <td>
                    <button 
                        type="button" 
                        class="btn-tabela"
                        onclick="abrirEditarOS(${item.linha})"
                    >
                        Editar
                    </button>
                </td>

                <td>
                    <button 
                        type="button" 
                        class="btn-whatsapp"
                        onclick="enviarWhatsAppPorLinha(${item.linha})"
                    >
                        Avisar
                    </button>
                </td>

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

    const selectStatus = document.getElementById("status-" + linha);
    const novoStatus = selectStatus.value;

    const dados = {
        action: "atualizarStatusOS",
        linha: linha,
        status: novoStatus
    };

    selectStatus.disabled = true;

    try {

        const resposta = await fetch(URL_SCRIPT,{
            method:"POST",
            body:JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if(resultado.sucesso){

    selectStatus.disabled = false;

    const linhaTabela = selectStatus.closest("tr");

    linhaTabela.classList.remove(
        "linha-retirado",
        "linha-aguardando",
        "linha-sem-conserto",
        "linha-finalizado",
        "linha-analise"
    );

    const novaClasse = classeStatus(novoStatus);

    if(novaClasse){
        linhaTabela.classList.add(novaClasse);
    }

<<<<<<< HEAD
            const ordem = ordensCarregadas.find(function(item){
                return Number(item.linha) === Number(linha);
            });

            if(ordem){
                ordem.status = novoStatus;
            }

            if(novoStatus === "Finalizado"){
                perguntarEnvioWhatsApp(linha);
            }

        } else {
=======
    const ordem = ordensCarregadas.find(function(item){
        return Number(item.linha) === Number(linha);
    });

    if(ordem){
        ordem.status = novoStatus;
    }

    if(novoStatus === "Finalizado"){
        perguntarEnvioWhatsApp(linha);
    }

} else {
>>>>>>> 94448b3b8335b412988ab13c4d02b9d601696a41

            selectStatus.disabled = false;
            alert("Erro ao atualizar status.");

        }

    } catch(erro){

        selectStatus.disabled = false;
        alert("Erro ao atualizar status.");
        console.error(erro);

    }

}


function formatarData(data){

    if(!data){
        return "";
    }

    // Se vier como texto no formato ISO do Google Sheets
    if(typeof data === "string" && data.includes("T")){
        const apenasData = data.split("T")[0];
        const partes = apenasData.split("-");

        if(partes.length === 3){
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
    }

    // Se vier como YYYY-MM-DD
    if(typeof data === "string" && data.includes("-")){
        const partes = data.split("-");

        if(partes.length === 3){
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
    }

    return data;

}

function abrirDetalhesOS(linha){

    const ordem = ordensCarregadas.find(function(item){
        return Number(item.linha) === Number(linha);
    });

    if(!ordem){
        alert("Ordem de serviço não encontrada.");
        return;
    }
    ordemSelecionadaPDF = ordem;

    document.getElementById("detalheOS").textContent = ordem.os || "";
    document.getElementById("detalheData").textContent = formatarData(ordem.data);
    document.getElementById("detalheCliente").textContent = ordem.cliente || "";
    document.getElementById("detalheTelefone").textContent = ordem.telefone || "";
    document.getElementById("detalheModelo").textContent = ordem.modelo || "";
    document.getElementById("detalheStatus").textContent = ordem.status || "";

    document.getElementById("detalheOrcamento").textContent =
        "R$ " + Number(ordem.orcamento || 0).toFixed(2);

    document.getElementById("detalheCusto").textContent =
        "R$ " + Number(ordem.custoPeca || 0).toFixed(2);

    document.getElementById("detalheLucro").textContent =
        "R$ " + Number(ordem.lucro || 0).toFixed(2);

    document.getElementById("detalheFornecedor").textContent = ordem.fornecedor || "";
    document.getElementById("detalheGarantia").textContent = formatarData(ordem.garantia);

    document.getElementById("detalheDefeito").textContent =
        ordem.defeito || "Nenhum defeito informado.";

    document.getElementById("detalheLaudo").textContent =
        ordem.laudo || "Nenhum laudo informado.";

    document.getElementById("detalheSubtitulo").textContent =
        "OS " + ordem.os + " - " + ordem.cliente;

    document.getElementById("modalDetalhesOS").classList.add("ativo");

}

function fecharDetalhesOS(){

    document
        .getElementById("modalDetalhesOS")
        .classList
        .remove("ativo");

}

function classeStatus(status){

    const statusNormalizado = String(status || "")
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    if(statusNormalizado === "retirado"){
        return "linha-retirado";
    }

    if(statusNormalizado === "aguardando peca"){
        return "linha-aguardando";
    }

    if(
        statusNormalizado === "sem conserto" ||
        statusNormalizado === "sem concerto"
    ){
        return "linha-sem-conserto";
    }

    if(statusNormalizado === "finalizado"){
        return "linha-finalizado";
    }

    if(statusNormalizado === "em analise"){
        return "linha-analise";
    }

    return "";
}

function abrirEditarOS(linha){

    const ordem = ordensCarregadas.find(function(item){
        return Number(item.linha) === Number(linha);
    });

    if(!ordem){
        alert("Ordem de serviço não encontrada.");
        return;
    }

    document.getElementById("editarLinhaOS").value = ordem.linha;
    document.getElementById("editarNumeroOS").value = ordem.os || "";
    document.getElementById("editarDataOS").value = converterDataParaInput(ordem.data);
    document.getElementById("editarClienteOS").value = ordem.cliente || "";
    document.getElementById("editarTelefoneOS").value = ordem.telefone || "";
    document.getElementById("editarModeloOS").value = ordem.modelo || "";
    document.getElementById("editarDefeitoOS").value = ordem.defeito || "";
    document.getElementById("editarLaudoOS").value = ordem.laudo || "";
    document.getElementById("editarOrcamentoOS").value = ordem.orcamento || "";
    document.getElementById("editarCustoPecaOS").value = ordem.custoPeca || "";
    document.getElementById("editarFornecedorOS").value = ordem.fornecedor || "";

    if(ordem.status === "Sem concerto"){
        document.getElementById("editarStatusOS").value = "Sem conserto";
    } else {
        document.getElementById("editarStatusOS").value = ordem.status || "Em análise";
    }

    document.getElementById("editarSubtitulo").textContent =
        "OS " + ordem.os + " - " + ordem.cliente;

    document.getElementById("modalEditarOS").classList.add("ativo");

}

function fecharEditarOS(){

    document
        .getElementById("modalEditarOS")
        .classList
        .remove("ativo");

}

function converterDataParaInput(data){

    if(!data){
        return "";
    }

    if(typeof data === "string" && data.includes("T")){
        return data.split("T")[0];
    }

    if(typeof data === "string" && data.includes("-")){
        return data;
    }

    return "";

}

function gerarPDFCliente(){

    if(!ordemSelecionadaPDF){
        alert("Nenhuma OS selecionada.");
        return;
    }

    const ordem = ordemSelecionadaPDF;

    const htmlPDF = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>OS ${ordem.os} - Smartiliza</title>

            <style>
            *{
                box-sizing:border-box;
                font-family:Arial, sans-serif;
            }

            @page{
                size:A4;
                margin:10mm;
            }

            body{
                margin:0;
                padding:0;
                background:#fff;
                color:#222;
                font-size:12px;
            }

            .documento{
                width:100%;
                max-width:760px;
                margin:auto;
                padding:0;
            }

            .topo{
                display:flex;
                justify-content:space-between;
                align-items:flex-start;
                border-bottom:2px solid #003B73;
                padding-bottom:8px;
                margin-bottom:10px;
            }

            .marca h1{
                margin:0;
                color:#003B73;
                font-size:24px;
                line-height:1;
            }

            .marca span{
                color:#FF7A00;
                font-weight:bold;
                font-size:12px;
            }

            .numero-os{
                text-align:right;
                font-size:12px;
            }

            .numero-os strong{
                display:block;
                color:#003B73;
                font-size:18px;
                margin:2px 0;
            }

            .secao{
                margin-bottom:9px;
            }

            .secao h2{
                color:#003B73;
                font-size:14px;
                border-bottom:1px solid #ddd;
                padding-bottom:4px;
                margin:0 0 6px 0;
            }

            .grid{
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:6px 14px;
            }

            .campo{
                margin-bottom:4px;
            }

            .campo span{
                display:block;
                font-size:10px;
                color:#666;
                font-weight:bold;
                text-transform:uppercase;
                margin-bottom:2px;
            }

            .campo strong,
            .campo p{
                margin:0;
                font-size:12px;
                color:#222;
                line-height:1.35;
            }

            .texto-longo{
                background:#f7f9fc;
                border:1px solid #ddd;
                padding:7px;
                border-radius:6px;
                min-height:35px;
                max-height:90px;
                overflow:hidden;
                white-space:pre-wrap;
                font-size:12px;
                line-height:1.35;
            }

            .garantia{
                background:#fff7ed;
                border:1px solid #fdba74;
                border-radius:8px;
                padding:9px;
                margin-top:8px;
            }

            .garantia h2{
                color:#9a3412;
                border:none;
                margin:0 0 5px 0;
                padding:0;
                font-size:14px;
            }

            .garantia p{
                margin:0 0 4px 0;
                line-height:1.35;
                font-size:11px;
            }

            .assinaturas{
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:35px;
                margin-top:28px;
            }

            .assinatura{
                text-align:center;
                border-top:1px solid #222;
                padding-top:5px;
                font-size:11px;
            }

            .rodape{
                margin-top:12px;
                padding-top:7px;
                border-top:1px solid #ddd;
                font-size:10px;
                color:#666;
                text-align:center;
                line-height:1.3;
            }

            @media print{
                body{
                    padding:0;
                }

                .documento{
                    border:none;
                }
            }
        </style>
        </head>

        <body>

            <div class="documento">

                <div class="topo">
                    <div class="marca">
                        <h1>Smartiliza</h1>
                        <span>Assistência Técnica</span>
                    </div>

                    <div class="numero-os">
                        <span>Ordem de Serviço</span>
                        <strong>${ordem.os || ""}</strong>
                        <small>Data: ${formatarData(ordem.data)}</small>
                    </div>
                </div>

                <div class="secao">
                    <h2>Dados do Cliente</h2>

                    <div class="grid">
                        <div class="campo">
                            <span>Cliente</span>
                            <strong>${ordem.cliente || ""}</strong>
                        </div>

                        <div class="campo">
                            <span>Telefone</span>
                            <strong>${ordem.telefone || ""}</strong>
                        </div>
                    </div>
                </div>

                <div class="secao">
                    <h2>Dados do Aparelho</h2>

                    <div class="grid">
                        <div class="campo">
                            <span>Modelo</span>
                            <strong>${ordem.modelo || ""}</strong>
                        </div>

                        <div class="campo">
                            <span>Status</span>
                            <strong>${ordem.status || ""}</strong>
                        </div>
                    </div>
                </div>

                <div class="secao">
                    <h2>Defeito Relatado</h2>

                    <div class="texto-longo">
                        ${ordem.defeito || "Nenhum defeito informado."}
                    </div>
                </div>

                <div class="secao">
                    <h2>Laudo Técnico / Serviço Realizado</h2>

                    <div class="texto-longo">
                        ${ordem.laudo || "Nenhum laudo informado."}
                    </div>
                </div>

                <div class="secao">
                    <h2>Valores e Garantia</h2>

                    <div class="grid">
                        <div class="campo">
                            <span>Valor do Serviço</span>
                            <strong>${formatarMoedaPDF(ordem.orcamento)}</strong>
                        </div>

                        <div class="campo">
                            <span>Garantia até</span>
                            <strong>${formatarData(ordem.garantia)}</strong>
                        </div>
                    </div>
                </div>

                <div class="garantia">
                    <h2>Termo de Garantia</h2>

                    <p>
                        A garantia cobre apenas o serviço realizado e/ou a peça substituída, dentro do prazo informado nesta ordem de serviço.
                    </p>

                    <p>
                        A garantia não cobre danos causados por queda, mau uso, pressão, trinca, contato com líquido, umidade, oxidação, molhado, tentativa de reparo por terceiros, violação do aparelho ou qualquer dano físico após a retirada.
                    </p>

                    <p>
                        A garantia poderá ser recusada caso o aparelho apresente sinais de queda, oxidação, abertura indevida ou uso inadequado.
                    </p>
                </div>

                <div class="assinaturas">
                    <div class="assinatura">
                        Assinatura do Cliente
                    </div>

                    <div class="assinatura">
                        Responsável Técnico
                    </div>
                </div>

                <div class="rodape">
                    Smartiliza - Assistência Técnica<br>
                    Documento gerado automaticamente pela Central de Serviços.
                </div>

            </div>

            <script>
                window.onload = function(){
                    window.print();
                }
            <\/script>

        </body>
        </html>
    `;

    const janela = window.open("", "_blank");

    janela.document.open();
    janela.document.write(htmlPDF);
    janela.document.close();

}

function formatarMoedaPDF(valor){

    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}

<<<<<<< HEAD
function enviarWhatsAppPorLinha(linha){
=======
function perguntarEnvioWhatsApp(linha){
>>>>>>> 94448b3b8335b412988ab13c4d02b9d601696a41

    const ordem = ordensCarregadas.find(function(item){
        return Number(item.linha) === Number(linha);
    });

    if(!ordem){
<<<<<<< HEAD
        alert("Ordem de serviço não encontrada.");
=======
        alert("Ordem de serviço não encontrada para envio da mensagem.");
        return;
    }

    const confirmar = confirm(
        "OS finalizada. Deseja avisar o cliente pelo WhatsApp?"
    );

    if(!confirmar){
>>>>>>> 94448b3b8335b412988ab13c4d02b9d601696a41
        return;
    }

    enviarWhatsAppFinalizado(ordem);

}

<<<<<<< HEAD
=======

>>>>>>> 94448b3b8335b412988ab13c4d02b9d601696a41
function enviarWhatsAppFinalizado(ordem){

    const telefoneLimpo = String(ordem.telefone || "")
        .replace(/\D/g, "");

    if(!telefoneLimpo){
        alert("Telefone do cliente não encontrado.");
        return;
    }

    const telefoneBrasil = telefoneLimpo.startsWith("55")
        ? telefoneLimpo
        : "55" + telefoneLimpo;

    const valorServico = Number(ordem.orcamento || 0)
        .toFixed(2)
        .replace(".", ",");

    const mensagem =
`Olá, ${ordem.cliente}! Aqui é da Smartiliza Assistência Técnica.

Sua ordem de serviço nº ${ordem.os}, referente ao aparelho ${ordem.modelo}, foi finalizada e já está pronta para retirada.

Valor total do serviço: R$ ${valorServico}

O comprovante/termo de garantia será enviado em seguida.

Aguardamos sua retirada. Obrigado!`;

    const link =
        "https://wa.me/" +
        telefoneBrasil +
        "?text=" +
        encodeURIComponent(mensagem);

    window.open(link, "_blank");

<<<<<<< HEAD
}

const editarOSForm = document.getElementById("editarOSForm");

if(editarOSForm){

    editarOSForm.addEventListener("submit", async function(e){

        e.preventDefault();

        const dados = {
            action: "editarOS",

            linha: document.getElementById("editarLinhaOS").value,
            os: document.getElementById("editarNumeroOS").value,
            data: document.getElementById("editarDataOS").value,
            cliente: document.getElementById("editarClienteOS").value,
            telefone: document.getElementById("editarTelefoneOS").value,
            modelo: document.getElementById("editarModeloOS").value,
            defeito: document.getElementById("editarDefeitoOS").value,
            laudo: document.getElementById("editarLaudoOS").value,
            orcamento: document.getElementById("editarOrcamentoOS").value,
            custoPeca: document.getElementById("editarCustoPecaOS").value,
            fornecedor: document.getElementById("editarFornecedorOS").value,
            status: document.getElementById("editarStatusOS").value
        };

        try {

            const resposta = await fetch(URL_SCRIPT,{
                method:"POST",
                body:JSON.stringify(dados)
            });

            const resultado = await resposta.json();

            if(resultado.sucesso){
                alert("OS atualizada com sucesso!");
                fecharEditarOS();
                carregarOrdens();
            } else {
                alert(resultado.mensagem || "Erro ao atualizar OS.");
            }

        } catch(erro){

            alert("Erro ao atualizar OS.");
            console.error(erro);

        }

    });

}
=======
}
>>>>>>> 94448b3b8335b412988ab13c4d02b9d601696a41
