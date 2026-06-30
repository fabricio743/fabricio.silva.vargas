function logout() {
    localStorage.removeItem("logado");
    window.location.href = "login.html";
}
