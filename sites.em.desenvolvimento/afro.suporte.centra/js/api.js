/* =====================================================
   API - COMUNICAÇÃO COM GOOGLE APPS SCRIPT
===================================================== */


/* =====================================================
   BUSCAR DADOS (JSONP)
===================================================== */

function apiGet(action, parametros = {}) {

    return new Promise((resolve, reject) => {

        const callbackName =
            "callback_" + Date.now() + "_" +
            Math.floor(Math.random() * 10000);

        const script = document.createElement("script");

        const dados = new URLSearchParams({
            action,
            ...parametros,
            callback: callbackName
        });

        const url = `${CONFIG.URL_SCRIPT}?${dados.toString()}`;

        const tempoLimite = setTimeout(() => {
            finalizar();
            reject(new Error("Tempo limite de conexão excedido."));
        }, 15000);

        function finalizar() {
            clearTimeout(tempoLimite);
            delete window[callbackName];
            script.remove();
        }

        window[callbackName] = (resposta) => {
            finalizar();
            resolve(resposta);
        };

        script.onerror = () => {
            finalizar();
            reject(new Error("Não foi possível conectar ao servidor."));
        };

        script.src = url;

        document.body.appendChild(script);

    });
}


/* =====================================================
   ENVIAR DADOS (POST)
===================================================== */

async function apiPost(action, dados = {}) {

    try {

        const parametros = new URLSearchParams();

        parametros.append("action", action);
        parametros.append("dados", JSON.stringify(dados));

        const resposta = await fetch(CONFIG.URL_SCRIPT, {
            method: "POST",
            body: parametros
        });

        if (!resposta.ok) {
            throw new Error("Erro na comunicação com o servidor.");
        }

        return await resposta.json();

    } catch (erro) {

        console.error("Erro na API:", erro);

        throw erro;

    }

}