console.log("Painel Administrativo iniciado.");

function logout(){

localStorage.removeItem("logado");

window.location.href =
"login.html";

}
