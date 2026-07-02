const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbwcJ9dQGc25pIn_dyQbRw0W8koa2_Za9bFMdIN5cHEgnXtIL-QOWuG0UC5LnYpRQ6x8/exec";

let categorias = [];
let receitas = [];
let despesas = [];
let guardado = [];

document.addEventListener("DOMContentLoaded", iniciarSistema);

function iniciarSistema() {
    definirDataAtual();
    definirMesAtual();
    configurarFormularios();
    carregarTudo();
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

async function carregarTudo() {
    await carregarCategorias();
    await carregarReceitas();
    await carregarDespesas();
    await carregarGuardado();

    atualizarTudoNaTela();
}

async function carregarCategorias() {
    try {
        const resposta = await fetch(`${URL_SCRIPT}?action=listarCategorias`);
        const resultado = await resposta.json();

        if (!resultado.sucesso) return;

        categorias = resultado.categorias;

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
        const resposta = await fetch(`${URL_SCRIPT}?action=listarReceitas`);
        const resultado = await resposta.json();

        if (!resultado.sucesso) return;

        receitas = resultado.lancamentos;

    } catch (erro) {
        console.error("Erro ao carregar receitas:", erro);
    }
}

async function carregarDespesas() {
    try {
        const resposta = await fetch(`${URL_SCRIPT}?action=listarDespesas`);
        const resultado = await resposta.json();

        if (!resultado.sucesso) return;

        despesas = resultado.lancamentos;

    } catch (erro) {
        console.error("Erro ao carregar despesas:", erro);
    }
}

async function carregarGuardado() {
    try {
        const resposta = await fetch(`${URL_SCRIPT}?action=listarGuardado`);
        const resultado = await resposta.json();

        if (!resultado.sucesso) return;

        guardado = resultado.lancamentos;

    } catch (erro) {
        console.error("Erro ao carregar guardado:", erro);
    }
}

async function salvarReceita(evento) {
    evento.preventDefault();

    const botao = evento.submitter;
    ativarLoadingBotao(botao);

    try {
        const linha = document.getElementById("linhaReceita").value;

        const dados = {
            action: linha ? "editarReceita" : "novaReceita",
            linha: linha,
            data: document.getElementById("dataReceita").value,
            tipo: document.getElementById("tipoReceita").value,
            informacoes: document.getElementById("infoReceita").value,
            valor: document.getElementById("valorReceita").value
        };

        await enviarDados(dados);

        limparFormReceita();
        await carregarTudo();

    } finally {
        desativarLoadingBotao(botao);
    }
}

async function salvarDespesa(evento) {
    evento.preventDefault();

    const botao = evento.submitter;
    ativarLoadingBotao(botao);

    try {
        const linha = document.getElementById("linhaDespesa").value;

        const dados = {
            action: linha ? "editarDespesa" : "novaDespesa",
            linha: linha,
            data: document.getElementById("dataDespesa").value,
            tipo: document.getElementById("tipoDespesa").value,
            informacoes: document.getElementById("infoDespesa").value,
            valor: document.getElementById("valorDespesa").value,
            metodoPagamento: document.getElementById("metodoDespesa").value,
            status: document.getElementById("statusDespesa").value
        };

        await enviarDados(dados);

        limparFormDespesa();
        await carregarTudo();

    } finally {
        desativarLoadingBotao(botao);
    }
}

async function salvarGuardado(evento) {
    evento.preventDefault();

    const botao = evento.submitter;
    ativarLoadingBotao(botao);

    try {
        const linha = document.getElementById("linhaGuardado").value;

        const dados = {
            action: linha ? "editarGuardado" : "novoGuardado",
            linha: linha,
            data: document.getElementById("dataGuardado").value,
            tipo: document.getElementById("tipoGuardado").value,
            informacoes: document.getElementById("infoGuardado").value,
            valor: document.getElementById("valorGuardado").value
        };

        await enviarDados(dados);

        limparFormGuardado();
        await carregarTudo();

    } finally {
        desativarLoadingBotao(botao);
    }
}

async function salvarCategoria(evento) {
    evento.preventDefault();

    const botao = evento.submitter;
    ativarLoadingBotao(botao);

    try {
        const linha = document.getElementById("linhaCategoria").value;

        const dados = {
            action: linha ? "editarCategoria" : "novaCategoria",
            linha: linha,
            area: document.getElementById("areaCategoria").value,
            tipo: document.getElementById("tipoCategoria").value,
            ativo: document.getElementById("ativoCategoria").value
        };

        await enviarDados(dados);

        limparFormCategoria();
        await carregarTudo();

    } finally {
        desativarLoadingBotao(botao);
    }
}

async function enviarDados(dados) {
    try {
        const resposta = await fetch(URL_SCRIPT, {
            method: "POST",
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resultado.sucesso) {
            alert(resultado.mensagem || "Erro ao salvar.");
            return;
        }

        alert(resultado.mensagem || "Salvo com sucesso.");

    } catch (erro) {
        console.error("Erro ao enviar dados:", erro);
        alert("Erro ao enviar dados.");
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
                <td>${formatarData(item.data)}</td>
                <td>${item.tipo}</td>
                <td>${item.informacoes || ""}</td>
                <td>${formatarMoeda(item.valor)}</td>
                <td>
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
                <td>${formatarData(item.data)}</td>
                <td>${item.tipo}</td>
                <td>${item.informacoes || ""}</td>
                <td>${formatarMoeda(item.valor)}</td>
                <td>${item.metodoPagamento || ""}</td>
                <td>${item.status || ""}</td>
                <td>
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
                <td>${formatarData(item.data)}</td>
                <td>${item.tipo}</td>
                <td>${item.informacoes || ""}</td>
                <td>${formatarMoeda(item.valor)}</td>
                <td>
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
                <td>${item.area}</td>
                <td>${item.tipo}</td>
                <td>${item.ativo}</td>
                <td>
                    <button class="btn editar" onclick="editarCategoria(${item.linha})">
                        Editar
                    </button>
                </td>
            </tr>
        `;
    });
}

function editarReceita(linha) {
    mostrarLoadingEdicao();

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
    }, 500);
}

function editarDespesa(linha) {
    mostrarLoadingEdicao();

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
    }, 500);
}

function editarGuardado(linha) {
    mostrarLoadingEdicao();

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
    }, 500);
}

function editarCategoria(linha) {
    mostrarLoadingEdicao();

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
    }, 500);
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

    if (!filtro) {
        return lista;
    }

    return lista.filter(item => {
        const data = new Date(item.data);

        if (isNaN(data)) {
            return false;
        }

        const anoItem = data.getFullYear();
        const mesItem = data.getMonth() + 1;

        return anoItem === filtro.ano && mesItem === filtro.mes;
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
    const tbody = document.getElementById("resumoCategorias");
    tbody.innerHTML = "";

    const resumo = [];

    categorias.forEach(cat => {
        let lista = [];

        if (cat.area === "receita") {
            lista = receitasFiltradas;
        }

        if (cat.area === "despesas") {
            lista = despesasFiltradas;
        }

        if (cat.area === "guardado") {
            lista = guardadoFiltrado;
        }

        const total = lista
            .filter(item => item.tipo === cat.tipo)
            .reduce((soma, item) => soma + Number(item.valor || 0), 0);

        if (total > 0) {
            resumo.push({
                area: cat.area,
                tipo: cat.tipo,
                total: total
            });
        }
    });

    if (resumo.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3">Nenhum valor lançado neste mês.</td>
            </tr>
        `;
        return;
    }

    resumo.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>${item.area}</td>
                <td>${item.tipo}</td>
                <td>${formatarMoeda(item.total)}</td>
            </tr>
        `;
    });
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

    const d = new Date(data);

    if (isNaN(d)) return data;

    return d.toLocaleDateString("pt-BR");
}

function converterDataInput(data) {
    if (!data) return "";

    const d = new Date(data);

    if (isNaN(d)) return data;

    return d.toISOString().split("T")[0];
}