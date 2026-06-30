console.log("API administrativa carregada.");

if (!window.CONFIG || !window.CONFIG.URL_SCRIPT) {
    console.error("CONFIG.URL_SCRIPT não encontrado. Confira se o config.js foi carregado antes do api.js.");
    alert("Erro de configuração: config.js não foi carregado corretamente.");
}

window.URL_API = window.CONFIG.URL_SCRIPT;

async function enviarParaPlanilha(dados) {
    await fetch(URL_API, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(dados)
    });
}

async function buscarNaPlanilha(action, parametros = {}) {
    const url = new URL(URL_API);

    url.searchParams.set("action", action);

    Object.keys(parametros).forEach(chave => {
        url.searchParams.set(chave, parametros[chave]);
    });

    const resposta = await fetch(url.toString());

    return await resposta.json();
}