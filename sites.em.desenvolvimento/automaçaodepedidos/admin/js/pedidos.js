// PEDIDOS

let pedidos = [];
let atualizacaoPedidos = null;

document.addEventListener("DOMContentLoaded", () => {
    carregarPedidos();
    iniciarAtualizacaoPedidos();
});

document.addEventListener("input", function(e) {
    if (e.target.id === "buscaPedido") {
        filtrarPedidos();
    }
});

document.addEventListener("change", function(e) {
    if (e.target.classList.contains("filtro-status")) {
        const todos = document.querySelector('.filtro-status[value="Todos"]');

        const outros = Array.from(
            document.querySelectorAll('.filtro-status:not([value="Todos"])')
        );

        if (e.target.value === "Todos" && e.target.checked) {
            outros.forEach(input => {
                input.checked = false;
            });
        } else {
            if (todos) {
                todos.checked = false;
            }
        }

        const algumMarcado =
            document.querySelectorAll(".filtro-status:checked").length > 0;

        if (!algumMarcado && todos) {
            todos.checked = true;
        }

        filtrarPedidos();
    }
});

async function carregarPedidos() {
    try {
        pedidos = await buscarNaPlanilha("listarPedidos");

        if (typeof filtrarPedidos === "function") {
            filtrarPedidos();
        } else {
            renderizarPedidos(pedidos);
        }

    } catch (erro) {
        console.error(erro);
    }
}

function renderizarPedidos(lista) {
    const container = document.getElementById("listaPedidos");

    if (!container) return;

    container.innerHTML = "";

    lista.forEach(pedido => {
        container.innerHTML += `

            <div class="pedido-card ${classeStatusPedido(pedido.status)}">

                <div class="pedido-topo">

                    <strong>${pedido.id}</strong>

                    <select
                        class="status-select"
                        onchange="alterarStatusPedido('${pedido.id}', this.value)">

                        <option ${pedido.status === "Recebido" ? "selected" : ""}>
                            Recebido
                        </option>

                        <option ${pedido.status === "Preparando" ? "selected" : ""}>
                            Preparando
                        </option>

                        <option ${pedido.status === "Pronto" ? "selected" : ""}>
                            Pronto
                        </option>

                        <option ${pedido.status === "Entregue" ? "selected" : ""}>
                            Entregue
                        </option>

                        <option ${pedido.status === "Cancelado" ? "selected" : ""}>
                            Cancelado
                        </option>

                    </select>

                </div>

                <p>👤 ${pedido.cliente}</p>
                <p>📱 ${pedido.telefone}</p>
                <p>📅 ${pedido.data}</p>
                <p>🕒 ${pedido.horario}</p>
                <p>💳 ${pedido.pagamento}</p>
                <p>💰 R$ ${pedido.total}</p>

                <button
                    class="btn-editar"
                    onclick="verPedido('${pedido.id}')">
                    Detalhes
                </button>

            </div>

        `;
    });
}

function filtrarPedidos() {
    const busca = document.getElementById("buscaPedido");

    const textoBusca =
        busca ? busca.value.toLowerCase() : "";

    const filtrosMarcados = Array.from(
        document.querySelectorAll(".filtro-status:checked")
    ).map(input => input.value);

    const mostrarTodos =
        filtrosMarcados.includes("Todos") ||
        filtrosMarcados.length === 0;

    const resultado = pedidos.filter(pedido => {
        const textoPedido =
            (
                pedido.id + " " +
                pedido.cliente + " " +
                pedido.telefone
            ).toLowerCase();

        const combinaBusca =
            textoPedido.includes(textoBusca);

        const combinaStatus =
            mostrarTodos ||
            filtrosMarcados.includes(pedido.status);

        return combinaBusca && combinaStatus;
    });

    renderizarPedidos(resultado);
}

async function alterarStatusPedido(id, status) {
    try {
        await enviarParaPlanilha({
            action: "alterarStatusPedido",
            id: id,
            status: status
        });

        setTimeout(() => {
            carregarPedidos();
        }, 800);

    } catch (erro) {
        console.error(erro);
    }
}

async function verPedido(idPedido){

    try{

        const pedido =
        pedidos.find(p =>
            String(p.id) === String(idPedido)
        );

        if(!pedido){

            alert("Pedido não encontrado.");

            return;

        }

        const itens =
        await buscarNaPlanilha(
            "listarItensPedido",
            {
                idPedido:idPedido
            }
        );

        abrirDetalhesPedido(
            pedido,
            itens
        );

    }catch(erro){

        console.error(erro);

        alert(
            "Erro ao carregar detalhes do pedido."
        );

    }

}
function abrirDetalhesPedido(pedido,itens){

    const modal =
    document.getElementById("modalDetalhesPedido");

    const numero =
    document.getElementById("detalheNumeroPedido");

    const conteudo =
    document.getElementById("conteudoDetalhesPedido");

    if(!modal || !conteudo) return;

    numero.innerText =
    pedido.id;

    const enderecoHtml =
    pedido.tipo === "Entrega"
    ? `
        <div class="detalhe-card detalhe-endereco">
            <h3>📍 Endereço de entrega</h3>

            <p>
                <strong>Município:</strong>
                ${pedido.municipio || "-"}
            </p>

            <p>
                <strong>Rua:</strong>
                ${pedido.rua || "-"}
            </p>

            <p>
                <strong>Número:</strong>
                ${pedido.numero || "-"}
            </p>

            <p>
                <strong>Complemento:</strong>
                ${pedido.complemento || "-"}
            </p>
        </div>
    `
    : `
        <div class="detalhe-card">
            <h3>🏪 Retirada</h3>
            <p>Cliente irá retirar no local.</p>
        </div>
    `;

    let itensHtml = "";

    itens.forEach(item => {

        const quantidade =
        Number(item.quantidade) || 0;

        const preco =
        Number(item.preco) || 0;

        const subtotal =
        quantidade * preco;

        itensHtml += `

            <div class="item-pedido-detalhe">

                <div>
                    <strong>
                        ${item.produto}
                    </strong>

                    <span>
                        ${quantidade}x R$ ${preco.toFixed(2).replace(".", ",")}
                    </span>
                </div>

                <strong>
                    R$ ${subtotal.toFixed(2).replace(".", ",")}
                </strong>

            </div>

        `;

    });

    conteudo.innerHTML = `

        <div class="detalhe-status ${classeStatusPedido(pedido.status)}">
            ${pedido.status}
        </div>

        <div class="detalhes-grid">

            <div class="detalhe-card">
                <h3>👤 Cliente</h3>

                <p>
                    <strong>Nome:</strong>
                    ${pedido.cliente || "-"}
                </p>

                <p>
                    <strong>WhatsApp:</strong>
                    ${pedido.telefone || "-"}
                </p>
            </div>

            <div class="detalhe-card">
                <h3>📅 Pedido</h3>

                <p>
                    <strong>Data:</strong>
                    ${pedido.data || "-"}
                </p>

                <p>
                    <strong>Horário:</strong>
                    ${pedido.horario || "-"}
                </p>

                <p>
                    <strong>Tipo:</strong>
                    ${pedido.tipo || "-"}
                </p>
            </div>

            <div class="detalhe-card">
                <h3>💳 Pagamento</h3>

                <p>
                    <strong>Forma:</strong>
                    ${pedido.pagamento || "-"}
                </p>

                <p>
                    <strong>Subtotal:</strong>
                    R$ ${Number(pedido.subtotal || 0).toFixed(2).replace(".", ",")}
                </p>

                <p>
                    <strong>Taxa entrega:</strong>
                    R$ ${Number(pedido.taxaEntrega || 0).toFixed(2).replace(".", ",")}
                </p>
            </div>

            ${enderecoHtml}

        </div>

        <div class="detalhe-card detalhe-itens">
            <h3>🧾 Itens do pedido</h3>

            ${itensHtml || "<p>Nenhum item encontrado.</p>"}
        </div>

        ${
            pedido.observacao
            ? `
                <div class="detalhe-card">
                    <h3>📝 Observação</h3>
                    <p>${pedido.observacao}</p>
                </div>
            `
            : ""
        }

        <div class="detalhe-total">
            <span>Total do pedido</span>
            <strong>
                R$ ${Number(pedido.total || 0).toFixed(2).replace(".", ",")}
            </strong>
        </div>

        <div class="detalhe-acoes">

            <button onclick="fecharDetalhesPedido()" class="btn-secundario">
                Fechar
            </button>

            <button onclick="abrirEditarPedido('${pedido.id}')" class="btn-secundario">
                Editar pedido
            </button>

            <button onclick="abrirWhatsAppPedido('${pedido.telefone}', '${pedido.id}')" class="btn-whatsapp">
                Enviar WhatsApp
            </button>

        </div>

    `;

    modal.classList.add("active");

}
function classeStatusPedido(status) {
    const statusFormatado =
        String(status)
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "-");

    return "pedido-" + statusFormatado;
}
function abrirWhatsAppPedido(telefone,idPedido){

    if(!telefone){

        alert("Telefone não informado.");

        return;

    }

    const numero =
    String(telefone)
    .replace(/\D/g,"");

    const mensagem =
    encodeURIComponent(
        "Olá! Sobre seu pedido " +
        idPedido +
        ", estamos entrando em contato."
    );

    window.open(
        "https://wa.me/55" + numero + "?text=" + mensagem,
        "_blank"
    );

}
function fecharDetalhesPedido(){

    const modal =
    document.getElementById("modalDetalhesPedido");

    if(modal){

        modal.classList.remove("active");

    }

}
function iniciarAtualizacaoPedidos() {
    if (atualizacaoPedidos) {
        return;
    }

    atualizacaoPedidos = setInterval(() => {
        carregarPedidos();
    }, 10000);
}
function abrirEditarPedido(idPedido){

    const pedido =
    pedidos.find(p =>
        String(p.id) === String(idPedido)
    );

    if(!pedido){

        alert("Pedido não encontrado.");

        return;

    }

    document.getElementById("editarPedidoId").value =
    pedido.id;

    document.getElementById("editarNumeroPedido").innerText =
    pedido.id;

    document.getElementById("editarCliente").value =
    pedido.cliente || "";

    document.getElementById("editarTelefone").value =
    pedido.telefone || "";

    document.getElementById("editarData").value =
    converterDataParaInput(pedido.data);

    document.getElementById("editarHorario").value =
    pedido.horario || "";

    document.getElementById("editarStatus").value =
    pedido.status || "Recebido";

    document.getElementById("editarPagamento").value =
    pedido.pagamento || "PIX";

    document.getElementById("editarTipo").value =
    pedido.tipo || "Retirada";

    document.getElementById("editarTotal").value =
    Number(pedido.total || 0).toFixed(2);

    document.getElementById("editarMunicipio").value =
    pedido.municipio || "";

    document.getElementById("editarRua").value =
    pedido.rua || "";

    document.getElementById("editarNumeroEndereco").value =
    pedido.numero || "";

    document.getElementById("editarComplemento").value =
    pedido.complemento || "";

    document.getElementById("editarObservacao").value =
    pedido.observacao || "";

    controlarEnderecoEdicao();

    fecharDetalhesPedido();

    document
    .getElementById("modalEditarPedido")
    .classList.add("active");

}
function fecharEditarPedido(){

    const modal =
    document.getElementById("modalEditarPedido");

    if(modal){

        modal.classList.remove("active");

    }

}
function controlarEnderecoEdicao(){

    const tipo =
    document.getElementById("editarTipo").value;

    const box =
    document.getElementById("editarEnderecoBox");

    if(!box) return;

    box.style.display =
    tipo === "Entrega"
    ? "block"
    : "none";

}
function converterDataParaInput(dataBR){

    if(!dataBR){
        return "";
    }

    const partes =
    String(dataBR).split("/");

    if(partes.length !== 3){
        return "";
    }

    return partes[2] + "-" + partes[1] + "-" + partes[0];

}
function converterDataParaBR(dataInput){

    if(!dataInput){
        return "";
    }

    const partes =
    dataInput.split("-");

    return partes[2] + "/" + partes[1] + "/" + partes[0];

}
async function salvarEdicaoPedido(){

    const id =
    document.getElementById("editarPedidoId").value;

    const tipo =
    document.getElementById("editarTipo").value;

    const dados = {

        action:"editarPedido",

        id:id,

        cliente:
        document.getElementById("editarCliente").value,

        telefone:
        document.getElementById("editarTelefone").value,

        data:
        converterDataParaBR(
            document.getElementById("editarData").value
        ),

        horario:
        document.getElementById("editarHorario").value,

        status:
        document.getElementById("editarStatus").value,

        pagamento:
        document.getElementById("editarPagamento").value,

        tipo:tipo,

        total:
        document.getElementById("editarTotal").value,

        subtotal:
        document.getElementById("editarTotal").value,

        taxaEntrega:
        0,

        observacao:
        document.getElementById("editarObservacao").value,

        endereco:{

            municipio:
            tipo === "Entrega"
            ? document.getElementById("editarMunicipio").value
            : "",

            rua:
            tipo === "Entrega"
            ? document.getElementById("editarRua").value
            : "",

            numero:
            tipo === "Entrega"
            ? document.getElementById("editarNumeroEndereco").value
            : "",

            complemento:
            tipo === "Entrega"
            ? document.getElementById("editarComplemento").value
            : ""

        }

    };

    try{

        await enviarParaPlanilha(dados);

        fecharEditarPedido();

        setTimeout(() => {

            carregarPedidos();

        }, 800);

        alert("Pedido atualizado com sucesso!");

    }catch(erro){

        console.error(erro);

        alert("Erro ao editar pedido.");

    }

}

window.verPedido = verPedido;
window.fecharDetalhesPedido = fecharDetalhesPedido;
window.abrirWhatsAppPedido = abrirWhatsAppPedido;
window.abrirEditarPedido = abrirEditarPedido;
window.fecharEditarPedido = fecharEditarPedido;
window.salvarEdicaoPedido = salvarEdicaoPedido;
window.controlarEnderecoEdicao = controlarEnderecoEdicao;

