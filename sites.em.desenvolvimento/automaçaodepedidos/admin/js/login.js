const form = document.getElementById("loginForm");
const mensagem = document.getElementById("mensagem");

form.addEventListener("submit", (e) => {

e.preventDefault();

const usuario =
document.getElementById("usuario").value;

const senha =
document.getElementById("senha").value;

if(
usuario === "admin" &&
senha === "123456"
){

localStorage.setItem(
"logado",
"true"
);

window.location.href =
"index.html";

}else{

mensagem.innerHTML =
"Usuário ou senha inválidos";

mensagem.style.color =
"#dc2626";

}

});