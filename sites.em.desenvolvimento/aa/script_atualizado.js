const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbwoFwwCpUFqzRLT9R1IJ-_wL1OZSV0gLScFU1YMR4yY3JDQNU3YtdG-uOm7tsSfmnPs/exec";

let categorias = [];
let receitas = [];
let despesas = [];
let guardado = [];

document.addEventListener("DOMContentLoaded", iniciarSistema);

async function iniciarSistema() {
    mostrarLoading("Carregando sistema...");

    try {
        definirDataAtual();
        definirMesAtual();
        configurarFormularios();

        await carregarTudo();

    } catch (erro) {
        console.error(
            "Erro ao iniciar sistema:",
            erro
        );

    } finally {
        esconderLoading();
    }
}

function mostrarTela(idTela, botao) {
    document.querySelectorAll(".tela").forEach(tela => {
        tela.classList.remove("ativa");
    });

    document.getElementById(idTela).classList.add("ativa");

    document.querySelectorAll(".menu-item").forEach(item => {
        item.classList.remove("active");
    });

    botao.classList.add("active");

    const titulos = {
        dashboard: "Principal",
        receitas: "Receitas",
        despesas: "Despesas",
        guardado: "Guardado",
        categorias: "Categorias"
    };

    document.getElementById("tituloPagina").textContent = titulos[idTela];
}

function definirDataAtual() {
    const hoje = new Date().toISOString().split("T")[0];

    document.getElementById("dataReceita").value = hoje;
    document.getElementById("dataDespesa").value = hoje;
    document.getElementById("dataGuardado").value = hoje;
}

function definirMesAtual() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");

    document.getElementById("filtroMes").value = `${ano}-${mes}`;
}

function configurarFormularios() {
    document.getElementById("formReceita").addEventListener("submit", salvarReceita);
    document.getElementById("formDespesa").addEventListener("submit", salvarDespesa);
    document.getElementById("formGuardado").addEventListener("submit", salvarGuardado);
    document.getElementById("formCategoria").addEventListener("submit", salvarCategoria);
}

async function carregarTudo(mostrarCarregamento = false) {
    if (mostrarCarregamento) {
        mostrarLoading("Atualizando informações...");
    }

    try {
        await carregarCategorias();
        await carregarReceitas();
        await carregarDespesas();
        await carregarGuardado();

        atualizarTudoNaTela();

    } finally {
        if (mostrarCarregamento) {
            esconderLoading();
        }
    }
}

async function carregarCategorias() {
    try {
        const resultado = await buscarJSONP(
            `${URL_SCRIPT}?action=listarCategorias`
        );

        if (!resultado.sucesso) {
            console.error("Erro ao carregar categorias:", resultado.mensagem);
            return;
        }

        categorias = resultado.categorias || [];
        preencherSelectsCategorias();
        listarCategoriasNaTela();

    } catch (erro) {
        console.error("Erro ao carregar categorias:", erro);
    }
}

function preencherSelectsCategorias() {
    const selectReceita = document.getElementById("tipoReceita");
    const selectDespesa = document.getElementById("tipoDespesa");
    const selectGuardado = document.getElementById("tipoGuardado");

    selectReceita.innerHTML = "";
    selectDespesa.innerHTML = "";
    selectGuardado.innerHTML = "";

    categorias
        .filter(cat => cat.ativo === "sim")
        .forEach(cat => {
            const option = document.createElement("option");
            option.value = cat.tipo;
            option.textContent = cat.tipo;

            if (cat.area === "receita") {
                selectReceita.appendChild(option);
            }

            if (cat.area === "despesas") {
                selectDespesa.appendChild(option);
            }

            if (cat.area === "guardado") {
                selectGuardado.appendChild(option);
            }
        });
}

async function carregarReceitas() {
    try {
        const resultado = await buscarJSONP(
            `${URL_SCRIPT}?action=listarReceitas`
        );

        if (!resultado.sucesso) {
            console.error("Erro ao listar receitas:", resultado.mensagem);
            return;
        }

        receitas = resultado.lancamentos;

        console.log("Receitas carregadas:", receitas);

    } catch (erro) {
        console.error("Erro ao carregar receitas:", erro);
    }
}

function buscarJSONP(url) {
    return new Promise((resolve, reject) => {
        const callbackName = `jsonpCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;

        window[callbackName] = function (dados) {
            resolve(dados);

            delete window[callbackName];
            script.remove();
        };

        const script = document.createElement("script");

        const separador = url.includes("?") ? "&" : "?";

        script.src = `${url}${separador}callback=${callbackName}`;

        script.onerror = function () {
            reject(new Error("Erro ao carregar JSONP"));

            delete window[callbackName];
            script.remove();
        };

        document.body.appendChild(script);
    });
}

async function carregarDespesas() {
    try {
        const resultado = await buscarJSONP(
            `${URL_SCRIPT}?action=listarDespesas`
        );

        if (!resultado.sucesso) {
            console.error("Erro ao listar despesas:", resultado.mensagem);
            return;
        }

        despesas = resultado.lancamentos;

        console.log("Despesas carregadas:", despesas);

    } catch (erro) {
        console.error("Erro ao carregar despesas:", erro);
    }
}

async function carregarGuardado() {
    try {
        const resultado = await buscarJSONP(
            `${URL_SCRIPT}?action=listarGuardado`
        );

        if (!resultado.sucesso) {
            console.error("Erro ao listar guardado:", resultado.mensagem);
            return;
        }

        guardado = resultado.lancamentos;

        console.log("Guardado carregado:", guardado);

    } catch (erro) {
        console.error("Erro ao carregar guardado:", erro);
    }
}

async function salvarReceita(evento) {
    evento.preventDefault();

    const linha =
        document.getElementById("linhaReceita").value;

    mostrarLoading(
        linha
            ? "Atualizando receita..."
            : "Salvando receita..."
    );

    try {
        const dados = {
            action: linha
                ? "editarReceita"
                : "novaReceita",

            linha: linha,

            data:
                document.getElementById("dataReceita").value,

            tipo:
                document.getElementById("tipoReceita").value,

            informacoes:
                document.getElementById("infoReceita").value,

            valor:
                document.getElementById("valorReceita").value
        };

        await enviarDados(dados);

        limparFormReceita();
        await carregarTudo();

    } catch (erro) {
        console.error(
            "Erro ao salvar receita:",
            erro
        );

    } finally {
        esconderLoading();
    }
}

async function salvarDespesa(evento) {
    evento.preventDefault();

    const linha =
        document.getElementById("linhaDespesa").value;

    mostrarLoading(
        linha
            ? "Atualizando despesa..."
            : "Salvando despesa..."
    );

    try {
        const dados = {
            action: linha
                ? "editarDespesa"
                : "novaDespesa",

            linha: linha,

            data:
                document.getElementById("dataDespesa").value,

            tipo:
                document.getElementById("tipoDespesa").value,

            informacoes:
                document.getElementById("infoDespesa").value,

            valor:
                document.getElementById("valorDespesa").value,

            metodoPagamento:
                document.getElementById("metodoDespesa").value,

            status:
                document.getElementById("statusDespesa").value
        };

        await enviarDados(dados);

        limparFormDespesa();
        await carregarTudo();

    } catch (erro) {
        console.error(
            "Erro ao salvar despesa:",
            erro
        );

    } finally {
        esconderLoading();
    }
}

async function salvarGuardado(evento) {
    evento.preventDefault();

    const linha =
        document.getElementById("linhaGuardado").value;

    mostrarLoading(
        linha
            ? "Atualizando valor guardado..."
            : "Salvando valor guardado..."
    );

    try {
        const dados = {
            action: linha
                ? "editarGuardado"
                : "novoGuardado",

            linha: linha,

            data:
                document.getElementById("dataGuardado").value,

            tipo:
                document.getElementById("tipoGuardado").value,

            informacoes:
                document.getElementById("infoGuardado").value,

            valor:
                document.getElementById("valorGuardado").value
        };

        await enviarDados(dados);

        limparFormGuardado();
        await carregarTudo();

    } catch (erro) {
        console.error(
            "Erro ao salvar valor guardado:",
            erro
        );

    } finally {
        esconderLoading();
    }
}

async function salvarCategoria(evento) {
    evento.preventDefault();

    const linha =
        document.getElementById("linhaCategoria").value;

    mostrarLoading(
        linha
            ? "Atualizando categoria..."
            : "Salvando categoria..."
    );

    try {
        const dados = {
            action: linha
                ? "editarCategoria"
                : "novaCategoria",

            linha: linha,

            area:
                document.getElementById("areaCategoria").value,

            tipo:
                document.getElementById("tipoCategoria").value,

            ativo:
                document.getElementById("ativoCategoria").value
        };

        await enviarDados(dados);

        limparFormCategoria();
        await carregarTudo();

    } catch (erro) {
        console.error(
            "Erro ao salvar categoria:",
            erro
        );

    } finally {
        esconderLoading();
    }
}

async function enviarDados(dados) {
    try {
        const resposta = await fetch(URL_SCRIPT, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resultado.sucesso) {
            throw new Error(resultado.mensagem || "Erro ao salvar.");
        }

        alert(resultado.mensagem || "Salvo com sucesso.");
        return resultado;

    } catch (erro) {
        console.error("Erro ao enviar dados:", erro);
        alert(erro.message || "Erro ao enviar dados.");
        throw erro;
    }
}

function listarReceitasNaTela() {
    const tbody = document.getElementById("listaReceitas");
    tbody.innerHTML = "";

    const receitasFiltradas = filtrarPorMes(receitas);

    if (receitasFiltradas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5">Nenhuma receita lançada neste mês.</td>
            </tr>
        `;
        return;
    }

    receitasFiltradas.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td data-label="Data">${formatarData(item.data)}</td>
                <td data-label="Tipo">${item.tipo}</td>
                <td data-label="Informações">${item.informacoes || ""}</td>
                <td data-label="Valor">${formatarMoeda(item.valor)}</td>
                <td data-label="Ação">
                    <button class="btn editar" onclick="editarReceita(${item.linha})">
                        Editar
                    </button>
                </td>
            </tr>
        `;
    });
}

function listarDespesasNaTela() {
    const tbody = document.getElementById("listaDespesas");
    tbody.innerHTML = "";

    const despesasFiltradas = filtrarPorMes(despesas);

    if (despesasFiltradas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">Nenhuma despesa lançada neste mês.</td>
            </tr>
        `;
        return;
    }

    despesasFiltradas.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td data-label="Data">${formatarData(item.data)}</td>
                <td data-label="Tipo">${item.tipo}</td>
                <td data-label="Informações">${item.informacoes || ""}</td>
                <td data-label="Valor">${formatarMoeda(item.valor)}</td>
                <td data-label="Pagamento">${item.metodoPagamento || ""}</td>
                <td data-label="Status">${item.status || ""}</td>
                <td data-label="Ação">
                    <button class="btn editar" onclick="editarDespesa(${item.linha})">
                        Editar
                    </button>
                </td>
            </tr>
        `;
    });
}

function listarGuardadoNaTela() {
    const tbody = document.getElementById("listaGuardado");
    tbody.innerHTML = "";

    const guardadoFiltrado = filtrarPorMes(guardado);

    if (guardadoFiltrado.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5">Nenhum valor guardado neste mês.</td>
            </tr>
        `;
        return;
    }

    guardadoFiltrado.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td data-label="Data">${formatarData(item.data)}</td>
                <td data-label="Tipo">${item.tipo}</td>
                <td data-label="Informações">${item.informacoes || ""}</td>
                <td data-label="Valor">${formatarMoeda(item.valor)}</td>
                <td data-label="Ação">
                    <button class="btn editar" onclick="editarGuardado(${item.linha})">
                        Editar
                    </button>
                </td>
            </tr>
        `;
    });
}

function listarCategoriasNaTela() {
    const tbody = document.getElementById("listaCategorias");
    tbody.innerHTML = "";

    categorias.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td data-label="Área">${item.area}</td>
                <td data-label="Tipo">${item.tipo}</td>
                <td data-label="Ativo">${item.ativo}</td>
                <td data-label="Ação">
                    <button class="btn editar" onclick="editarCategoria(${item.linha})">
                        Editar
                    </button>
                </td>
            </tr>
        `;
    });
}

function editarReceita(linha) {
    mostrarLoading("Carregando dados...");
    esconderLoading();

    setTimeout(() => {
        const item = receitas.find(r => r.linha === linha);
        if (!item) {
            esconderLoadingEdicao();
            return;
        }

        document.getElementById("linhaReceita").value = item.linha;
        document.getElementById("dataReceita").value = converterDataInput(item.data);
        document.getElementById("tipoReceita").value = item.tipo;
        document.getElementById("infoReceita").value = item.informacoes || "";
        document.getElementById("valorReceita").value = item.valor;

        mostrarTela("receitas", document.querySelectorAll(".menu-item")[1]);

        esconderLoadingEdicao();
    }, 250);
}

function editarDespesa(linha) {
    mostrarLoading("Carregando dados...");
    esconderLoading();

    setTimeout(() => {
        const item = despesas.find(d => d.linha === linha);
        if (!item) {
            esconderLoadingEdicao();
            return;
        }

        document.getElementById("linhaDespesa").value = item.linha;
        document.getElementById("dataDespesa").value = converterDataInput(item.data);
        document.getElementById("tipoDespesa").value = item.tipo;
        document.getElementById("infoDespesa").value = item.informacoes || "";
        document.getElementById("valorDespesa").value = item.valor;
        document.getElementById("metodoDespesa").value = item.metodoPagamento || "pix";
        document.getElementById("statusDespesa").value = item.status || "pago";

        mostrarTela("despesas", document.querySelectorAll(".menu-item")[2]);

        esconderLoadingEdicao();
    }, 250);
}

function editarGuardado(linha) {
    mostrarLoading("Carregando dados...");
    esconderLoading();

    setTimeout(() => {
        const item = guardado.find(g => g.linha === linha);
        if (!item) {
            esconderLoadingEdicao();
            return;
        }

        document.getElementById("linhaGuardado").value = item.linha;
        document.getElementById("dataGuardado").value = converterDataInput(item.data);
        document.getElementById("tipoGuardado").value = item.tipo;
        document.getElementById("infoGuardado").value = item.informacoes || "";
        document.getElementById("valorGuardado").value = item.valor;

        mostrarTela("guardado", document.querySelectorAll(".menu-item")[3]);

        esconderLoadingEdicao();
    }, 250);
}

function editarCategoria(linha) {
   mostrarLoading("Carregando dados...");
esconderLoading();

    setTimeout(() => {
        const item = categorias.find(c => c.linha === linha);
        if (!item) {
            esconderLoadingEdicao();
            return;
        }

        document.getElementById("linhaCategoria").value = item.linha;
        document.getElementById("areaCategoria").value = item.area;
        document.getElementById("tipoCategoria").value = item.tipo;
        document.getElementById("ativoCategoria").value = item.ativo;

        mostrarTela("categorias", document.querySelectorAll(".menu-item")[4]);

        esconderLoadingEdicao();
    }, 250);
}

function mostrarLoadingEdicao() {
    document.getElementById("loadingEdicao").classList.add("ativo");
}

function esconderLoadingEdicao() {
    document.getElementById("loadingEdicao").classList.remove("ativo");
}

function obterMesSelecionado() {
    const valor = document.getElementById("filtroMes").value;

    if (!valor) {
        return null;
    }

    const partes = valor.split("-");

    return {
        ano: Number(partes[0]),
        mes: Number(partes[1])
    };
}

function filtrarPorMes(lista) {
    const filtro = obterMesSelecionado();

    if (!filtro) return lista;

    return lista.filter(item => {
        const dataTexto = String(item.data || "").trim();
        const correspondencia = /^(\d{4})-(\d{2})-(\d{2})/.exec(dataTexto);

        if (!correspondencia) return false;

        return Number(correspondencia[1]) === filtro.ano
            && Number(correspondencia[2]) === filtro.mes;
    });
}

function atualizarDashboard() {
    const receitasFiltradas = filtrarPorMes(receitas);
    const despesasFiltradas = filtrarPorMes(despesas);
    const guardadoFiltrado = filtrarPorMes(guardado);

    const totalReceitas = somarValores(receitasFiltradas);
    const totalDespesas = somarValores(despesasFiltradas);
    const totalGuardado = somarValores(guardadoFiltrado);
    const saldoLivre = totalReceitas - totalDespesas - totalGuardado;

    document.getElementById("totalReceitas").textContent = formatarMoeda(totalReceitas);
    document.getElementById("totalDespesas").textContent = formatarMoeda(totalDespesas);
    document.getElementById("totalGuardado").textContent = formatarMoeda(totalGuardado);
    document.getElementById("saldoLivre").textContent = formatarMoeda(saldoLivre);

    montarResumoCategorias(receitasFiltradas, despesasFiltradas, guardadoFiltrado);
}

function atualizarTudoNaTela() {
    atualizarDashboard();

    listarReceitasNaTela();
    listarDespesasNaTela();
    listarGuardadoNaTela();
}

function ativarLoadingBotao(botao, texto = "Salvando...") {
    botao.disabled = true;
    botao.dataset.textoOriginal = botao.textContent;
    botao.textContent = texto;
    botao.classList.add("carregando");
}

function desativarLoadingBotao(botao) {
    botao.disabled = false;
    botao.textContent = botao.dataset.textoOriginal || "Salvar";
    botao.classList.remove("carregando");
}

function montarResumoCategorias(receitasFiltradas, despesasFiltradas, guardadoFiltrado) {
    montarGrupoResumo("resumoReceitas", "totalResumoReceitas", receitasFiltradas);
    montarGrupoResumo("resumoDespesas", "totalResumoDespesas", despesasFiltradas);
    montarGrupoResumo("resumoGuardado", "totalResumoGuardado", guardadoFiltrado);
}

function montarGrupoResumo(idLista, idTotal, lista) {
    const elementoLista = document.getElementById(idLista);
    const elementoTotal = document.getElementById(idTotal);

    if (!elementoLista || !elementoTotal) return;

    const agrupados = new Map();

    lista.forEach(item => {
        const tipo = String(item.tipo || "Sem categoria").trim();
        const chave = normalizarTexto(tipo);

        if (!agrupados.has(chave)) {
            agrupados.set(chave, { tipo, total: 0 });
        }

        agrupados.get(chave).total += converterValorNumero(item.valor);
    });

    const itens = Array.from(agrupados.values())
        .sort((a, b) => b.total - a.total);

    if (itens.length === 0) {
        elementoLista.innerHTML = `
            <div class="resumo-vazio">
                Nenhum lançamento neste mês
            </div>
        `;
    } else {
        elementoLista.innerHTML = itens.map(item => `
            <div class="resumo-item">
                <span>${escaparHTML(item.tipo)}</span>
                <strong>${formatarMoeda(item.total)}</strong>
            </div>
        `).join("");
    }

    elementoTotal.textContent = formatarMoeda(
        itens.reduce((soma, item) => soma + item.total, 0)
    );
}

function normalizarTexto(texto) {
    return String(texto || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function converterValorNumero(valor) {
    if (typeof valor === "number") {
        return Number.isFinite(valor) ? valor : 0;
    }

    let texto = String(valor || "")
        .replace("R$", "")
        .replace(/\s/g, "")
        .trim();

    if (!texto) return 0;

    if (texto.includes(",") && texto.includes(".")) {
        texto = texto.replace(/\./g, "").replace(",", ".");
    } else if (texto.includes(",")) {
        texto = texto.replace(",", ".");
    }

    const numero = Number(texto);
    return Number.isFinite(numero) ? numero : 0;
}

function escaparHTML(texto) {
    return String(texto || "").replace(/[&<>'"]/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
    })[caractere]);
}

function somarValores(lista) {
    return lista.reduce((soma, item) => {
        return soma + Number(item.valor || 0);
    }, 0);
}

function limparFormReceita() {
    document.getElementById("formReceita").reset();
    document.getElementById("linhaReceita").value = "";
    document.getElementById("dataReceita").value = new Date().toISOString().split("T")[0];
}

function limparFormDespesa() {
    document.getElementById("formDespesa").reset();
    document.getElementById("linhaDespesa").value = "";
    document.getElementById("dataDespesa").value = new Date().toISOString().split("T")[0];
}

function limparFormGuardado() {
    document.getElementById("formGuardado").reset();
    document.getElementById("linhaGuardado").value = "";
    document.getElementById("dataGuardado").value = new Date().toISOString().split("T")[0];
}

function limparFormCategoria() {
    document.getElementById("formCategoria").reset();
    document.getElementById("linhaCategoria").value = "";
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarData(data) {
    if (!data) return "";

    const texto = String(data).trim();
    const correspondencia = /^(\d{4})-(\d{2})-(\d{2})/.exec(texto);

    if (!correspondencia) return texto;

    return `${correspondencia[3]}/${correspondencia[2]}/${correspondencia[1]}`;
}

function converterDataInput(data) {
    if (!data) return "";

    const texto = String(data).trim();
    const correspondencia = /^(\d{4})-(\d{2})-(\d{2})/.exec(texto);

    return correspondencia
        ? `${correspondencia[1]}-${correspondencia[2]}-${correspondencia[3]}`
        : "";
}

let quantidadeCarregamentos = 0;

function mostrarLoading(texto = "Carregando...") {
    quantidadeCarregamentos++;

    const loading = document.getElementById("loadingGeral");
    const loadingTexto = document.getElementById("loadingTexto");

    if (!loading) return;

    if (loadingTexto) {
        loadingTexto.textContent = texto;
    }

    loading.classList.add("ativo");

    document.body.style.overflow = "hidden";
}


function esconderLoading() {
    quantidadeCarregamentos--;

    if (quantidadeCarregamentos > 0) {
        return;
    }

    quantidadeCarregamentos = 0;

    const loading = document.getElementById("loadingGeral");

    if (!loading) return;

    loading.classList.remove("ativo");

    document.body.style.overflow = "";
}