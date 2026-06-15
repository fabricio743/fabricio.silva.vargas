const logado =
localStorage.getItem("logado");

if(logado !== "true"){

window.location.href =
"login.html";

}