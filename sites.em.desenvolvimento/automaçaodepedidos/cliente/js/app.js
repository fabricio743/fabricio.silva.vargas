let etapa = 1;
let total = 0;
let itens = 0;
let configuracoes = {};
let agendaCliente = [];

const URL_API = CONFIG.URL_SCRIPT;

carregarConfiguracoesCliente();

carregarAgendaCliente();

function atualizarBarra(){

    const passos =
    document.querySelectorAll(".step");

    passos.forEach((passo,index)=>{

        if(index < etapa){

            passo.classList.add("active");

        }else{

            passo.classList.remove("active");

        }

    });

}
function aumentar(btn){

    const card =
    btn.closest(".produto-card");

    const id =
    String(card.dataset.id);

    const nome =
    card.dataset.nome;

    const preco =
    Number(card.dataset.preco);

    const disponivel =
    Number(card.dataset.disponivel || 0);

    let span =
    btn.parentElement.querySelector("span");

    let valor =
    parseInt(span.innerText);

    if(valor >= disponivel){

        alert(
            "Quantidade máxima disponível para esta data."
        );

        return;

    }

    valor++;

    span.innerText = valor;

    itens++;

    total += preco;

    let produto =
    pedido.produtos.find(
        p => String(p.id) === String(id)
    );

    if(produto){

        produto.quantidade++;

    }else{

        pedido.produtos.push({

            id:id,

            nome:nome,

            preco:preco,

            quantidade:1

        });

    }

    atualizarCarrinho();

}
function diminuir(btn){

    const card =
    btn.closest(".produto-card");

    const id =
    String(card.dataset.id);

    const preco =
    Number(card.dataset.preco);

    let span =
    btn.parentElement.querySelector("span");

    let valor =
    parseInt(span.innerText);

    if(valor > 0){

        valor--;

        span.innerText = valor;

        itens--;

        total -= preco;

        let produto =
        pedido.produtos.find(
            p => String(p.id) === String(id)
        );

        if(produto){

            produto.quantidade--;

            if(produto.quantidade <= 0){

                pedido.produtos =
                pedido.produtos.filter(
                    p => String(p.id) !== String(id)
                );

            }

        }

        atualizarCarrinho();

    }

}
function atualizarCarrinho(){

    pedido.subtotal =
    pedido.produtos.reduce(
        (soma,item) =>
        soma + (
            Number(item.preco) *
            Number(item.quantidade)
        ),
        0
    );

    pedido.taxaEntrega =
    pedido.tipo === "Entrega"
    ? Number(configuracoes.taxaEntrega || 0)
    : 0;

    pedido.total =
    pedido.subtotal +
    pedido.taxaEntrega;

    document.getElementById("itens")
    .innerText =
    itens + " itens";

    document.getElementById("total")
    .innerText =
    "R$ " + pedido.total.toFixed(2);

}
const pedido = {
    produtos: [],
    idAgenda: "",
    data: "",
    horario: "",
    tipo: "",
    endereco: {
        municipio:"",
        rua:"",
        numero:"",
        complemento:""
    },
    cliente:{
        nome:"",
        whatsapp:"",
        observacao:""
    },
    pagamento:"",
    subtotal:0,
    taxaEntrega:0,
    total:0
};
function selecionarData(card,data){

    document
        .querySelectorAll(".data-card")
        .forEach(c =>
            c.classList.remove("selected")
        );

    card.classList.add("selected");

    pedido.data = data;

}
function selecionarHorario(botao, horario){

    document
        .querySelectorAll(".horario-btn")
        .forEach(btn =>
            btn.classList.remove("selected")
        );

    botao.classList.add("selected");

    pedido.horario = horario;

}
function selecionarTipo(card,tipo){

    document
        .querySelectorAll(".tipo-card")
        .forEach(c =>
            c.classList.remove("selected")
        );

    card.classList.add("selected");

    pedido.tipo = tipo;

    if(tipo === "Entrega"){

        document
            .getElementById("endereco")
            .style.display = "flex";

    }else{

        document
            .getElementById("endereco")
            .style.display = "none";

    }
    atualizarCarrinho();
}
function proximaEtapa(){

if(etapa === 1){

    if(!pedido.data){

        alert(
            "Selecione uma data."
        );

        return;

    }

    document
        .getElementById("etapa1")
        .style.display = "none";

    document
        .getElementById("etapa2")
        .style.display = "block";

    etapa = 2;

    atualizarBarra();

    return;

}

if(etapa === 2){

    if(pedido.produtos.length === 0){

        alert(
            "Selecione pelo menos um produto."
        );

        return;

    }

    atualizarCarrinho();

    const pedidoMinimo =
    Number(configuracoes.pedidoMinimo || 0);

    if(
        pedidoMinimo > 0
        &&
        pedido.subtotal < pedidoMinimo
    ){

        alert(
            "O pedido mínimo é de R$ " +
            pedidoMinimo
            .toFixed(2)
            .replace(".", ",")
        );

        return;

    }

    document
        .getElementById("etapa2")
        .style.display = "none";

    document
        .getElementById("etapa3")
        .style.display = "block";

    etapa = 3;

    atualizarBarra();

    return;

}
    
    if(etapa === 3){

    if(!pedido.horario){

        alert(
            "Selecione um horário."
        );

        return;

    }

    document
        .getElementById("etapa3")
        .style.display = "none";

    document
        .getElementById("etapa4")
        .style.display = "block";

    etapa = 4;

    atualizarBarra();

    return;
}
    if(etapa === 4){

    if(!pedido.tipo){

        alert(
            "Escolha entrega ou retirada."
        );

        return;
    }

    if(pedido.tipo === "Entrega"){

        pedido.endereco.municipio =
        document.getElementById("municipio").value;

        pedido.endereco.rua =
        document.getElementById("rua").value;

        pedido.endereco.numero =
        document.getElementById("numero").value;

        pedido.endereco.complemento =
        document.getElementById("complemento").value;

        if(
            !pedido.endereco.municipio ||
            !pedido.endereco.rua ||
            !pedido.endereco.numero
        ){

            alert(
                "Preencha o endereço."
            );

            return;
        }

    }

    document
        .getElementById("etapa4")
        .style.display = "none";

    document
        .getElementById("etapa5")
        .style.display = "block";

    etapa = 5;

    atualizarBarra();

    return;
}

if(etapa === 5){

    const nome =
    document.getElementById(
        "nomeCliente"
    ).value;

    const whatsapp =
    document.getElementById(
        "whatsappCliente"
    ).value;

    const observacao =
    document.getElementById(
        "observacaoCliente"
    ).value;

    if(!nome || !whatsapp){

        alert(
            "Preencha nome e WhatsApp."
        );

        return;
    }

    pedido.cliente.nome = nome;

    pedido.cliente.whatsapp = whatsapp;

    pedido.cliente.observacao = observacao;

    document
        .getElementById("etapa5")
        .style.display = "none";

    document
        .getElementById("etapa6")
        .style.display = "block";

    etapa = 6;

    atualizarBarra();

    return;

}

if(etapa === 6){

    if(!pedido.pagamento){

        alert(
            "Selecione uma forma de pagamento."
        );

        return;
    }

    atualizarCarrinho();

    document
        .getElementById("etapa6")
        .style.display = "none";

    document
        .getElementById("etapa7")
        .style.display = "block";

    gerarResumo();

    etapa = 7;

    atualizarBarra();

    return;

    }

    if(etapa === 7){

    document
        .getElementById("etapa7")
        .style.display = "none";

    document
        .getElementById("etapa8")
        .style.display = "block";

    etapa = 8;

    atualizarBarra();

    return;

}
}
document.addEventListener("input", function(e){

    if(e.target.id === "whatsappCliente"){

        let valor =
        e.target.value
        .replace(/\D/g,'');

        valor =
        valor.replace(
            /^(\d{2})(\d)/,
            "($1) $2"
        );

        valor =
        valor.replace(
            /(\d{5})(\d)/,
            "$1-$2"
        );

        e.target.value = valor;

    }

});
function voltarEtapa(){

    if(etapa === 1){
        return;
    }

    document
        .getElementById("etapa" + etapa)
        .style.display = "none";

    etapa--;

    document
        .getElementById("etapa" + etapa)
        .style.display = "block";

    atualizarBarra();

}
function atualizarBotaoVoltar(){

    const btn =
    document.getElementById("btnVoltar");

    if(etapa === 1){

        btn.style.display = "none";

    }else{

        btn.style.display = "block";

    }

}
function atualizarBarra(){

    const passos =
    document.querySelectorAll(".step");

    passos.forEach((passo,index)=>{

        if(index < etapa){

            passo.classList.add("active");

        }else{

            passo.classList.remove("active");

        }

    });

    atualizarBotaoVoltar();

}
function selecionarPagamento(card,pagamento){

    document
        .querySelectorAll(".pagamento-card")
        .forEach(c =>
            c.classList.remove("selected")
        );

    card.classList.add("selected");

    pedido.pagamento = pagamento;

    if(pagamento === "PIX"){

        document
            .getElementById("pixInfo")
            .style.display = "block";
        const pixInfo =
        document.getElementById("pixInfo");

        if(pixInfo){

            pixInfo.innerHTML = `

                <strong>
                    Pagamento via PIX
                </strong>

                <p>
                    Recebedor:
                    ${configuracoes.pixNome || "Não informado"}
                </p>

                <p>
                    Tipo:
                    ${configuracoes.pixTipo || "Não informado"}
                </p>

                <p>
                    Chave:
                    ${configuracoes.pixChave || "Não configurada"}
                </p>

                <button onclick="copiarPix()">
                    Copiar chave PIX
                </button>

            `;

        }

    }else{

        document
            .getElementById("pixInfo")
            .style.display = "none";

    }

}
function copiarPix(){

    const chavePix =
    configuracoes.pixChave || "";

    if(!chavePix){

        alert(
            "Chave PIX não configurada."
        );

        return;

    }

    navigator.clipboard.writeText(
        chavePix
    );

    alert(
        "Chave PIX copiada!"
    );

}
function gerarResumo(){

    let html = "";

    html += `
        <div class="resumo-titulo">
            Produtos
        </div>
    `;

    pedido.produtos.forEach(produto => {

        html += `
            <div class="resumo-item">
                <span>
                    ${produto.quantidade}x ${produto.nome}
                </span>

                <span>
                    R$ ${(produto.preco * produto.quantidade).toFixed(2)}
                </span>
            </div>
        `;

    });

    html += `
        <div class="resumo-titulo">
            Entrega
        </div>

        <p>${pedido.tipo}</p>

        <div class="resumo-titulo">
            Data
        </div>

        <p>${pedido.data}</p>

        <div class="resumo-titulo">
            Horário
        </div>

        <p>${pedido.horario}</p>

        <div class="resumo-titulo">
            Cliente
        </div>

        <p>${pedido.cliente.nome}</p>

        <p>${pedido.cliente.whatsapp}</p>

        <div class="resumo-titulo">
            Pagamento
        </div>

        <p>${pedido.pagamento}</p>
    `;

    if(pedido.tipo === "Entrega"){

        html += `

            <div class="resumo-titulo">
                Endereço
            </div>

            <p>
                ${pedido.endereco.rua},
                ${pedido.endereco.numero}
            </p>

            <p>
                ${pedido.endereco.municipio}
            </p>

        `;
    }

    html += `

    <div class="resumo-item">
        <span>Subtotal</span>
        <span>R$ ${pedido.subtotal.toFixed(2)}</span>
    </div>

    <div class="resumo-item">
        <span>Taxa de entrega</span>
        <span>R$ ${pedido.taxaEntrega.toFixed(2)}</span>
    </div>

    <div class="total-final">

        Total:
        R$ ${pedido.total.toFixed(2)}

    </div>
`;

    document
        .getElementById("resumoConteudo")
        .innerHTML = html;

}
function gerarNumeroPedido(){

    return "PED-" +
    Date.now();

}
async function finalizarPedido(){

    try{

        const numeroPedido =
        gerarNumeroPedido();

        pedido.numeroPedido =
        numeroPedido;

        await fetch(
            URL_API,
            {
                method:"POST",
                mode:"no-cors",
                body:JSON.stringify({

                    action:"novoPedido",

                    numeroPedido:
                    numeroPedido,

                    cliente:
                    pedido.cliente.nome,

                    telefone:
                    pedido.cliente.whatsapp,

                    data:
                    pedido.data,

                    idAgenda:
                    pedido.idAgenda,

                    horario:
                    pedido.horario,

                    pagamento:
                    pedido.pagamento,

                    subtotal:
                    pedido.subtotal,

                    taxaEntrega:
                    pedido.taxaEntrega,

                    total:
                    pedido.total,

                    observacao:
                    pedido.cliente.observacao,

                    tipo:
                    pedido.tipo,

                    endereco:
                    pedido.endereco,

                    itens:
                    pedido.produtos

                })
            }
        );

        document
            .getElementById("etapa8")
            .style.display = "none";

        document
            .getElementById("sucesso")
            .style.display = "block";

        document
            .getElementById("numeroPedido")
            .innerText =
            numeroPedido;

        const mensagemConfirmacao =
        document.getElementById("mensagemConfirmacao");

            if(mensagemConfirmacao){

                mensagemConfirmacao.innerText =
                configuracoes.mensagemConfirmacao ||
                "Pedido recebido com sucesso! Em breve entraremos em contato pelo WhatsApp.";

            }

        document
            .querySelector(".carrinho")
            .style.display = "none";

    }catch{

        alert(
            "Erro ao enviar pedido."
        );

    }

}
async function carregarConfiguracoesCliente(){

    try{

        const resposta =
        await fetch(
            URL_API +
            "?action=listarConfiguracoes"
        );

        configuracoes =
        await resposta.json();

        aplicarConfiguracoesCliente();

    }catch(erro){

        console.error(
            erro
        );

    }

}
function aplicarConfiguracoesCliente(){

    if(
        configuracoes.statusLoja ===
        "FECHADO"
    ){

        document.body.innerHTML = `

            <div class="loja-fechada">

                <h1>
                    🍖 ${configuracoes.nomeEmpresa || "Assados Bonito"}
                </h1>

                <h2>
                    Loja fechada no momento
                </h2>

                <p>
                    Tente novamente mais tarde.
                </p>

            </div>

        `;

        return;

    }
    const nomeLojaCliente =
    document.getElementById("nomeLojaCliente");

    if(nomeLojaCliente){

        nomeLojaCliente.innerText =
        configuracoes.nomeEmpresa ||
        "Assados Bonito";

    }

    const subtituloLojaCliente =
    document.getElementById("subtituloLojaCliente");

    if(subtituloLojaCliente){

        subtituloLojaCliente.innerText =
        "Faça seu pedido de forma rápida pelo WhatsApp " +
        (configuracoes.whatsapp || "");

    }
}
async function carregarProdutosCliente(){

    try{

        const resposta =
        await fetch(
            URL_API +
            "?action=listarProdutos"
        );

        const produtos =
        await resposta.json();

        renderizarProdutosCliente(
            produtos
        );

    }catch(erro){

        console.error(
            erro
        );

    }

}
async function carregarProdutosDoDiaCliente(idAgenda){

    try{

        const resposta =
        await fetch(
            URL_API +
            "?action=listarProdutosDoDia&idAgenda=" +
            idAgenda
        );

        const produtos =
        await resposta.json();

        renderizarProdutosCliente(
            produtos
        );

    }catch(erro){

        console.error(
            erro
        );

    }

}
function renderizarProdutosCliente(produtos){

    const container =
    document.getElementById(
        "listaProdutosCliente"
    );

    if(!container) return;

    container.innerHTML = "";

    if(produtos.length === 0){

        container.innerHTML = `

            <p>
                Nenhum produto disponível para esta data.
            </p>

        `;

        return;

    }

    produtos.forEach(produto => {

        if(produto.status !== "ATIVO") return;

        const disponivel =
        Number(produto.disponivel || 0);

        const bloqueado =
        disponivel <= 0;

        const imagemProduto =
        produto.imagem
        ? `<img 
                src="${produto.imagem}" 
                alt="${produto.nome}"
                onerror="this.style.display='none'; this.parentElement.innerHTML='🍗';"
           >`
        : "🍗";

        container.innerHTML += `

            <div
                class="produto-card ${bloqueado ? "produto-esgotado" : ""}"
                data-id="${produto.id}"
                data-nome="${produto.nome}"
                data-preco="${produto.preco}"
                data-disponivel="${disponivel}">

                <div class="produto-img">
                    ${imagemProduto}
                </div>

                <h3>
                    ${produto.nome}
                </h3>

                <p class="produto-descricao">
                    ${produto.descricao || ""}
                </p>

                <p class="preco">
                    R$ ${Number(produto.preco).toFixed(2).replace(".", ",")}
                </p>

                <small>
                    Disponível: ${disponivel}
                </small>

                <div class="quantidade">

                    <button 
                        onclick="diminuir(this)"
                        ${bloqueado ? "disabled" : ""}>
                        -
                    </button>

                    <span>0</span>

                    <button 
                        onclick="aumentar(this)"
                        ${bloqueado ? "disabled" : ""}>
                        +
                    </button>

                </div>

            </div>

        `;

    });

}
async function carregarAgendaCliente(){

    try{

        const resposta =
        await fetch(
            URL_API +
            "?action=listarAgenda"
        );

        agendaCliente =
        await resposta.json();

        renderizarDatasCliente();

    }catch(erro){

        console.error(
            erro
        );

    }

}
function renderizarDatasCliente(){

    const container =
    document.getElementById("listaDatasCliente");

    if(!container) return;

    container.innerHTML = "";

    agendaCliente.forEach(item => {

        if(item.status !== "ABERTO") return;

        container.innerHTML += `

            <div 
                class="data-card"
                onclick="selecionarDataCliente(this,'${item.id}')">

                <strong>
                    ${item.data}
                </strong>

                <span>
                    Disponível
                </span>

            </div>

        `;

    });

}
function selecionarDataCliente(card,idAgenda){

    document
    .querySelectorAll(".data-card")
    .forEach(c =>
        c.classList.remove("selected")
    );

    card.classList.add("selected");

    const agenda =
    agendaCliente.find(
        item => String(item.id) === String(idAgenda)
    );

    if(!agenda) return;

    pedido.data =
    agenda.data;

    pedido.idAgenda =
    agenda.id;

    pedido.produtos = [];

    itens = 0;

    total = 0;

    atualizarCarrinho();

    renderizarHorariosCliente(
        agenda
    );

    carregarProdutosDoDiaCliente(
        agenda.id
    );

}
function renderizarHorariosCliente(agenda){

    const container =
    document.getElementById("listaHorariosCliente");

    if(!container) return;

    container.innerHTML = "";

    const inicio =
    agenda.horaInicio;

    const fim =
    agenda.horaFim;

    const intervalo =
    Number(agenda.intervalo) || 30;

    let [hora,minuto] =
    inicio.split(":").map(Number);

    let [horaFim,minutoFim] =
    fim.split(":").map(Number);

    let atual =
    new Date();

    atual.setHours(hora);
    atual.setMinutes(minuto);
    atual.setSeconds(0);

    let limite =
    new Date();

    limite.setHours(horaFim);
    limite.setMinutes(minutoFim);
    limite.setSeconds(0);

    while(atual <= limite){

        const horario =
        String(atual.getHours()).padStart(2,"0") +
        ":" +
        String(atual.getMinutes()).padStart(2,"0");

        container.innerHTML += `

            <button
                class="horario-btn"
                onclick="selecionarHorario(this,'${horario}')">

                ${horario}

            </button>

        `;

        atual.setMinutes(
            atual.getMinutes() + intervalo
        );

    }

}