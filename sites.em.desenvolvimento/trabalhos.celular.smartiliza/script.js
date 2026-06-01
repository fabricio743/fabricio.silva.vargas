const URL_SCRIPT =
"https://script.google.com/macros/s/AKfycbxd07eFFBmVINIUS5eJ1suAc1WNM-z73h9B_jVfA-mNDIfJLNjpQ_nAPcYgRdJ9_LC0/exec";

document
.getElementById("osForm")
.addEventListener("submit", async function(e){

    e.preventDefault();

    const dados = {
        os: document.getElementById("os").value,
        data: document.getElementById("data").value,
        cliente: document.getElementById("cliente").value,
        telefone: document.getElementById("telefone").value,
        modelo: document.getElementById("modelo").value,
        defeito: document.getElementById("defeito").value,
        laudo: document.getElementById("laudo").value,
        custoPeca: document.getElementById("custoPeca").value,
        orcamento: document.getElementById("orcamento").value,
        status: document.getElementById("status").value,
    };

    try {

        const resposta = await fetch(URL_SCRIPT,{
            method:"POST",
            body:JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if(resultado.sucesso){
            alert("OS salva com sucesso!");
            document.getElementById("osForm").reset();
        }

    } catch(erro){

        alert("Erro ao salvar.");
        console.error(erro);

    }

});