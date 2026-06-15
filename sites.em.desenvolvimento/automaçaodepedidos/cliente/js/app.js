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

    let span =
    btn.parentElement.querySelector("span");

    let valor =
    parseInt(span.innerText);

    valor++;

    span.innerText = valor;

    itens++;

    total += 55;

    atualizarCarrinho();

}

function diminuir(btn){

    let span =
    btn.parentElement.querySelector("span");

    let valor =
    parseInt(span.innerText);

    if(valor > 0){

        valor--;

        span.innerText = valor;

        itens--;

        total -= 55;

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

    cliente:{},

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

}

