let etapa = 1;

let total = 0;
let itens = 0;

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
    Number(card.dataset.id);

    const nome =
    card.dataset.nome;

    const preco =
    Number(card.dataset.preco);

    let span =
    btn.parentElement.querySelector("span");

    let valor =
    parseInt(span.innerText);

    valor++;

    span.innerText = valor;

    itens++;

    total += preco;

    let produto =
    pedido.produtos.find(
        p => p.id === id
    );

    if(produto){

        produto.quantidade++;

    }else{

        pedido.produtos.push({

            id,

            nome,

            preco,

            quantidade:1

        });

    }

    atualizarCarrinho();

}

function diminuir(btn){

    const card =
    btn.closest(".produto-card");

    const id =
    Number(card.dataset.id);

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
            p => p.id === id
        );

        if(produto){

            produto.quantidade--;

            if(produto.quantidade <= 0){

                pedido.produtos =
                pedido.produtos.filter(
                    p => p.id !== id
                );

            }

        }

        atualizarCarrinho();

    }

}

function atualizarCarrinho(){

    document.getElementById("itens")
    .innerText =
    itens + " itens";

    document.getElementById("total")
    .innerText =
    "R$ " + total.toFixed(2);

}


// Função para adicionar um objeto do pedido

const pedido = {

    produtos: [],

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

    total:0

};

// Função para adicionar a data

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

// Selecionar o tipo do pedido

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

}

// Ajustar o fluxo

function proximaEtapa(){

if(etapa === 1){

    if(pedido.produtos.length === 0){

        alert(
            "Selecione pelo menos um produto."
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

        if(!pedido.data){

            alert(
                "Selecione uma data."
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

    pedido.total =
    pedido.produtos.reduce(
        (total,item)=>
            total + (item.preco * item.quantidade),
        0
    );

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

    }else{

        document
            .getElementById("pixInfo")
            .style.display = "none";

    }

}

function copiarPix(){

    navigator.clipboard.writeText(
        "55999999999"
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

        /*
        Aqui depois enviaremos
        para Google Sheets
        */

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

        document
            .querySelector(".carrinho")
            .style.display = "none";

    }catch{

        alert(
            "Erro ao enviar pedido."
        );

    }

}