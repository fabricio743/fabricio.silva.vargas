const pedidoInput = document.getElementById("pedido");
const tipoSelect = document.getElementById("tipo");
const enderecoDiv = document.getElementById("endereco");
const form = document.getElementById("pedidoForm");
const mensagem = document.getElementById("mensagem");

// Gera número do pedido
gerarNumeroPedido();

function gerarNumeroPedido() {

const numero =
    "PED-" +
    new Date().getFullYear() +
    "-" +
    Math.floor(Math.random() * 999999);

pedidoInput.value = numero;

}

// Mostra endereço apenas para entrega
tipoSelect.addEventListener("change", () => {

if (tipoSelect.value === "Entrega") {
    enderecoDiv.style.display = "block";
} else {
    enderecoDiv.style.display = "none";
}

});

// Enviar formulário
form.addEventListener("submit", async (e) => {


e.preventDefault();

const dados = {

    pedido: document.getElementById("pedido").value,
    cliente: document.getElementById("cliente").value,
    whatsapp: document.getElementById("whatsapp").value,
    produto: document.getElementById("produto").value,
    quantidade: document.getElementById("quantidade").value,
    pagamento: document.getElementById("pagamento").value,
    horario: document.getElementById("horario").value,
    tipo: document.getElementById("tipo").value,
    municipio: document.getElementById("municipio").value,
    rua: document.getElementById("rua").value,
    numero: document.getElementById("numero").value,
    complemento: document.getElementById("complemento").value

};

try {

    await fetch(
        "https://script.google.com/macros/s/AKfycbynvM67z-BHKGiS_wqBH_1X0D87IhVpcyUhE3RjBq21aZliLLqJ1DzXoXLQWII6zwKl/exec",
        {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify(dados)
        }
    );

    mensagem.style.display = "block";
    mensagem.className = "mensagem sucesso";
    mensagem.innerHTML = "✅ Pedido enviado com sucesso!";

    form.reset();

    gerarNumeroPedido();

    enderecoDiv.style.display = "none";

    setTimeout(() => {
        mensagem.style.display = "none";
    }, 5000);

} catch (erro) {

    console.error(erro);

    mensagem.style.display = "block";
    mensagem.className = "mensagem erro";
    mensagem.innerHTML = "❌ Erro ao enviar pedido.";

}


});
