
/* =====================================================
   SMARTILIZA - CENTRAL DE ORDENS DE SERVIÇO
===================================================== */

const URL_SCRIPT = CONFIG.URL_SCRIPT;

let ordensCarregadas = [];
let ordemSelecionadaPDF = null;
let carregandoOrdens = false;

const STATUS_OS = [
    "Em análise",
    "Aguardando aprovação do cliente",
    "Aguardando peça",
    "Finalizado",
    "Retirado",
    "Sem conserto"
];

const CLASSES_STATUS = [
    "linha-retirado",
    "linha-aguardando",
    "linha-sem-conserto",
    "linha-finalizado",
    "linha-analise",
    "linha-aprovacao"
];


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

window.addEventListener("load", function(){

    definirMesAtual();
    carregarOrdens();

});


/* =====================================================
   CARREGAMENTO
===================================================== */

function esconderLoadingSite(){

    const loadingSite = document.getElementById("loadingSite");

    if(loadingSite){

        loadingSite.classList.add("oculto");

    }

}


async function carregarOrdens(){

    if(carregandoOrdens) return;

    carregandoOrdens = true;

    const lista = document.getElementById("listaOrdens");
    const loading = document.getElementById("loadingOrdens");

    const botaoAtualizar =
        document.querySelector(".btn-atualizar-lista");

    if(botaoAtualizar){

        botaoAtualizar.disabled = true;
        botaoAtualizar.textContent = "Atualizando...";

    }

    if(loading){

        loading.style.display = "none";

    }

    if(lista){

        lista.innerHTML = `
            <tr>
                <td colspan="14" class="mensagem-tabela">

                    <div class="loading-tabela">

                        <span class="spinner-tabela"></span>

                        <span>Carregando ordens...</span>

                    </div>

                </td>
            </tr>
        `;

    }

    try {

        const resposta = await fetch(
            URL_SCRIPT + "?action=listarOS"
        );

        if(!resposta.ok){

            throw new Error("Erro HTTP " + resposta.status);

        }

        const texto = await resposta.text();

        let ordens;

        try {

            ordens = JSON.parse(texto);

        } catch(erroJson){

            throw new Error(
                "A resposta não é JSON. Verifique a URL do Apps Script."
            );

        }

        if(!Array.isArray(ordens)){

            throw new Error("Formato de resposta inválido.");

        }

        ordensCarregadas = [...ordens].reverse();

        aplicarFiltrosOrdens();

    } catch(erro){

        console.error("ERRO AO CARREGAR ORDENS:", erro);

        if(lista){

            lista.innerHTML = `
                <tr>
                    <td colspan="14" class="mensagem-tabela">

                        Erro ao carregar ordens.
                        Verifique a conexão com o Apps Script.

                    </td>
                </tr>
            `;

        }

    } finally {

        carregandoOrdens = false;

        if(loading){

            loading.style.display = "none";

        }

        if(botaoAtualizar){

            botaoAtualizar.disabled = false;
            botaoAtualizar.textContent = "↻ Atualizar lista";

        }

        esconderLoadingSite();

    }

}


/* =====================================================
   SEGURANÇA E FORMATAÇÃO DE TEXTOS
===================================================== */

function escaparHTML(valor){

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

}


function normalizarTexto(texto){

    return String(texto ?? "")
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}


function normalizarStatus(status){

    return normalizarTexto(status);

}


function obterStatusPadrao(status){

    const normalizado = normalizarStatus(status);

    if(normalizado === "sem concerto"){

        return "Sem conserto";

    }

    return STATUS_OS.find(function(item){

        return normalizarStatus(item) === normalizado;

    }) || "Em análise";

}


/* =====================================================
   RESUMO DO SERVIÇO
===================================================== */

function obterResumoServico(item){

    const laudo = String(item.laudo ?? "").trim();

    const defeito = String(item.defeito ?? "").trim();

    if(laudo){

        return {

            texto: laudo.replace(/\s+/g, " "),
            completo: laudo,
            vazio: false

        };

    }

    if(defeito){

        return {

            texto: "Defeito: " + defeito.replace(/\s+/g, " "),
            completo: "Defeito relatado: " + defeito,
            vazio: false

        };

    }

    return {

        texto: "Não informado",
        completo: "Nenhum serviço informado.",
        vazio: true

    };

}


/* =====================================================
   MOSTRAR ORDENS NA TABELA
===================================================== */

function mostrarOrdens(ordens){

    const lista = document.getElementById("listaOrdens");

    if(!lista) return;

    if(!ordens || ordens.length === 0){

        lista.innerHTML = `
            <tr>

                <td colspan="14" class="mensagem-tabela">

                    Nenhuma ordem encontrada.

                </td>

            </tr>
        `;

        return;

    }

    lista.innerHTML = "";

    const fragmento = document.createDocumentFragment();

    ordens.forEach(function(item){

        const linha = document.createElement("tr");

        const numeroLinha = Number(item.linha);

        const classe = classeStatus(item.status);

        const resumo = obterResumoServico(item);

        const lucro = Number(item.lucro || 0);

        const statusAtual = obterStatusPadrao(item.status);

        linha.classList.add("linha-clicavel");

        linha.tabIndex = 0;

        linha.dataset.linha = String(numeroLinha);

        linha.setAttribute(
            "aria-label",
            "Abrir ordem de serviço " + (item.os || "")
        );

        if(classe){

            linha.classList.add(classe);

        }


        /* OPÇÕES DO SELECT */

        const opcoesStatus = STATUS_OS.map(function(status){

            const selecionado = status === statusAtual
                ? "selected"
                : "";

            return `
                <option ${selecionado}
                    value="${escaparHTML(status)}">

                    ${escaparHTML(status)}

                </option>
            `;

        }).join("");


        /* CONTEÚDO DA LINHA */

        linha.innerHTML = `

            <td title="${escaparHTML(item.os)}">

                ${escaparHTML(item.os)}

            </td>


            <td>

                ${escaparHTML(formatarData(item.data))}

            </td>


            <td title="${escaparHTML(item.cliente)}">

                ${escaparHTML(item.cliente)}

            </td>


            <td title="${escaparHTML(item.telefone)}">

                ${escaparHTML(item.telefone)}

            </td>


            <td title="${escaparHTML(item.modelo)}">

                ${escaparHTML(item.modelo)}

            </td>


            <td>

                <span
                    class="${resumo.vazio
                        ? "servico-vazio"
                        : "servico-resumo"}"
                    title="${escaparHTML(resumo.completo)}"
                >

                    ${escaparHTML(resumo.texto)}

                </span>

            </td>


            <td>

                ${formatarMoedaPDF(item.orcamento)}

            </td>


            <td>

                ${formatarMoedaPDF(item.custoPeca)}

            </td>


            <td class="${lucro < 0
                ? "valor-negativo"
                : "valor-lucro"}">

                ${formatarMoedaPDF(lucro)}

            </td>


            <td>

                <select
                    class="status-select"
                    id="status-${numeroLinha}"
                    aria-label="Status da OS ${escaparHTML(item.os)}"
                    title="${escaparHTML(statusAtual)}"
                >

                    ${opcoesStatus}

                </select>

            </td>


            <td>

                ${escaparHTML(formatarData(item.garantia))}

            </td>


            <td>

                <button
                    type="button"
                    class="btn-tabela acao-editar"
                    title="Editar ordem de serviço"
                >

                    Editar

                </button>

            </td>


            <td>

                <button
                    type="button"
                    class="btn-whatsapp acao-whatsapp"
                    title="Avisar cliente pelo WhatsApp"
                >

                    Avisar

                </button>

            </td>


            <td>

                <button
                    type="button"
                    class="btn-salvar-status acao-salvar"
                    title="Salvar status"
                >

                    Salvar

                </button>

            </td>

        `;


        /* ABRIR OS AO CLICAR NA LINHA */

        linha.addEventListener("click", function(evento){

            if(evento.target.closest(
                "button, select, option, input, textarea, a, label"
            )){

                return;

            }

            const selecao = window.getSelection();

            if(selecao && selecao.toString().trim()){

                return;

            }

            abrirDetalhesOS(numeroLinha);

        });


        /* ACESSIBILIDADE PELO TECLADO */

        linha.addEventListener("keydown", function(evento){

            if(evento.target !== linha) return;

            if(evento.key === "Enter" || evento.key === " "){

                evento.preventDefault();

                abrirDetalhesOS(numeroLinha);

            }

        });


        /* SELECT DE STATUS */

        const select = linha.querySelector(".status-select");

        select.addEventListener("click", function(evento){

            evento.stopPropagation();

        });

        select.addEventListener("change", function(evento){

            evento.stopPropagation();

            salvarStatus(numeroLinha);

        });


        /* BOTÃO EDITAR */

        linha.querySelector(".acao-editar")
            .addEventListener("click", function(evento){

                evento.stopPropagation();

                abrirEditarOS(numeroLinha);

            });


        /* BOTÃO WHATSAPP */

        linha.querySelector(".acao-whatsapp")
            .addEventListener("click", function(evento){

                evento.stopPropagation();

                enviarWhatsAppPorLinha(numeroLinha);

            });


        /* BOTÃO SALVAR */

        linha.querySelector(".acao-salvar")
            .addEventListener("click", function(evento){

                evento.stopPropagation();

                salvarStatus(numeroLinha);

            });


        fragmento.appendChild(linha);

    });

    lista.appendChild(fragmento);

}


/* =====================================================
   ATUALIZAR INDICADORES
===================================================== */

function atualizarResumoOrdens(ordens){

    if(!Array.isArray(ordens)){

        ordens = [];

    }

    const abertas = ordens.filter(function(item){

        const status = normalizarStatus(item.status);

        return (
            status === "em analise" ||
            status === "aguardando aprovacao do cliente"
        );

    }).length;


    const aguardando = ordens.filter(function(item){

        return normalizarStatus(item.status) === "aguardando peca";

    }).length;


    const finalizadas = ordens.filter(function(item){

        return normalizarStatus(item.status) === "finalizado";

    }).length;


    const retiradas = ordens.filter(function(item){

        return normalizarStatus(item.status) === "retirado";

    }).length;


    const indicadores = {

        totalOrdensMes: ordens.length,
        totalAbertas: abertas,
        totalAguardando: aguardando,
        totalFinalizadas: finalizadas,
        totalRetiradas: retiradas

    };

    Object.entries(indicadores).forEach(function([id, valor]){

        const elemento = document.getElementById(id);

        if(elemento){

            elemento.textContent = valor;

        }

    });

}


/* =====================================================
   RESUMO DO MÊS SELECIONADO
===================================================== */

function atualizarResumoMesSelecionado(){

    const campoMes =
        document.getElementById("filtroMesDashboard");

    const mesSelecionado = campoMes
        ? campoMes.value
        : "";

    const ordensDoMes = ordensCarregadas.filter(function(item){

        return (
            mesSelecionado === "" ||
            obterAnoMes(item.data) === mesSelecionado
        );

    });

    atualizarResumoOrdens(ordensDoMes);

}


/* =====================================================
   FILTROS E PESQUISA
===================================================== */

function aplicarFiltrosOrdens(){

    const campoBusca =
        document.getElementById("campoBusca") ||
        document.getElementById("pesquisaOS");

    const campoStatus =
        document.getElementById("filtroStatus");

    const campoMes =
        document.getElementById("filtroMesDashboard");


    const texto = campoBusca

        ? normalizarTexto(campoBusca.value)

        : "";


    const statusSelecionado = campoStatus

        ? campoStatus.value

        : "";


    const mesSelecionado = campoMes

        ? campoMes.value

        : "";


    const statusFiltroNormalizado =
        normalizarStatus(statusSelecionado);


    const filtradas = ordensCarregadas.filter(function(item){

        const camposPesquisa = [

            item.os,
            item.cliente,
            item.telefone,
            item.modelo,
            item.laudo,
            item.defeito,
            item.fornecedor

        ];

        const bateTexto = camposPesquisa.some(function(campo){

            return normalizarTexto(campo).includes(texto);

        });

        const statusItem =
            normalizarStatus(item.status);

        const bateStatus =

            statusSelecionado === "" ||

            statusItem === statusFiltroNormalizado ||

            (
                statusFiltroNormalizado === "sem conserto" &&
                statusItem === "sem concerto"
            );


        /* PESQUISA EM TODOS OS MESES */

        const bateMes =

            texto !== "" ||

            mesSelecionado === "" ||

            obterAnoMes(item.data) === mesSelecionado;


        return bateTexto && bateStatus && bateMes;

    });


    atualizarResumoMesSelecionado();

    mostrarOrdens(filtradas);

}


function filtrarOrdens(){

    aplicarFiltrosOrdens();

}


/* =====================================================
   LOCALIZAR ORDEM
===================================================== */

function localizarOrdem(linha){

    return ordensCarregadas.find(function(item){

        return Number(item.linha) === Number(linha);

    });

}


/* =====================================================
   SALVAR STATUS
===================================================== */

async function salvarStatus(linha){

    const selectStatus =
        document.getElementById("status-" + linha);

    if(!selectStatus || selectStatus.disabled){

        return;

    }

    const ordem = localizarOrdem(linha);

    if(!ordem){

        alert("Ordem de serviço não encontrada.");

        return;

    }

    const novoStatus = selectStatus.value;

    const statusAnterior = obterStatusPadrao(ordem.status);

    const linhaTabela = selectStatus.closest("tr");

    const botaoSalvar =
        linhaTabela.querySelector(".btn-salvar-status");


    if(novoStatus === statusAnterior){

        return;

    }


    const dados = {

        action: "atualizarStatusOS",

        linha: linha,

        status: novoStatus

    };


    selectStatus.disabled = true;

    if(botaoSalvar){

        botaoSalvar.disabled = true;
        botaoSalvar.textContent = "...";

    }


    try {

        const resposta = await fetch(URL_SCRIPT, {

            method: "POST",

            body: JSON.stringify(dados)

        });

        if(!resposta.ok){

            throw new Error("Erro HTTP " + resposta.status);

        }

        const resultado = await resposta.json();

        if(!resultado.sucesso){

            throw new Error(
                resultado.mensagem || "Erro ao atualizar status."
            );

        }


        /* ATUALIZAR COR DA LINHA */

        linhaTabela.classList.remove(...CLASSES_STATUS);

        const novaClasse = classeStatus(novoStatus);

        if(novaClasse){

            linhaTabela.classList.add(novaClasse);

        }


        /* ATUALIZAR DADOS LOCAIS */

        ordem.status = novoStatus;

        selectStatus.title = novoStatus;


        /* ATUALIZAR INDICADORES */

        atualizarResumoMesSelecionado();


        /* WHATSAPP AO FINALIZAR */

        if(

            novoStatus === "Finalizado" &&

            statusAnterior !== "Finalizado"

        ){

            perguntarEnvioWhatsApp(linha);

        }


        /* ATUALIZAR LISTAGEM SE HOUVER FILTRO */

        const filtroStatus =
            document.getElementById("filtroStatus");

        if(filtroStatus && filtroStatus.value){

            aplicarFiltrosOrdens();

        }

    } catch(erro){

        selectStatus.value = statusAnterior;

        alert("Erro ao atualizar status.");

        console.error(erro);

    } finally {

        selectStatus.disabled = false;

        if(botaoSalvar){

            botaoSalvar.disabled = false;
            botaoSalvar.textContent = "Salvar";

        }

    }

}


/* =====================================================
   FORMATAÇÃO DE DATAS
===================================================== */

function formatarData(data){

    if(!data){

        return "";

    }

    const texto = String(data);

    const resultado =
        texto.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if(resultado){

        return `${resultado[3]}/${resultado[2]}/${resultado[1]}`;

    }

    return texto;

}


function converterDataParaInput(data){

    if(!data){

        return "";

    }

    const texto = String(data);

    const formatoISO =
        texto.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if(formatoISO){

        return `${formatoISO[1]}-${formatoISO[2]}-${formatoISO[3]}`;

    }

    const formatoBR =
        texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

    if(formatoBR){

        return `${formatoBR[3]}-${formatoBR[2]}-${formatoBR[1]}`;

    }

    return "";

}


/* =====================================================
   FORMATAÇÃO DE VALORES
===================================================== */

function formatarMoedaPDF(valor){

    const numero = Number(valor || 0);

    return (Number.isFinite(numero) ? numero : 0)
        .toLocaleString("pt-BR", {

            style: "currency",

            currency: "BRL"

        });

}


/* =====================================================
   CLASSES DOS STATUS
===================================================== */

function classeStatus(status){

    const statusNormalizado = normalizarStatus(status);

    switch(statusNormalizado){

        case "retirado":

            return "linha-retirado";

        case "aguardando peca":

            return "linha-aguardando";

        case "sem conserto":

        case "sem concerto":

            return "linha-sem-conserto";

        case "finalizado":

            return "linha-finalizado";

        case "em analise":

            return "linha-analise";

        case "aguardando aprovacao do cliente":

            return "linha-aprovacao";

        default:

            return "";

    }

}


/* =====================================================
   MODAL DE DETALHES
===================================================== */

function abrirDetalhesOS(linha){

    const ordem = localizarOrdem(linha);

    if(!ordem){

        alert("Ordem de serviço não encontrada.");

        return;

    }

    ordemSelecionadaPDF = ordem;


    const campos = {

        detalheOS: ordem.os || "",

        detalheData: formatarData(ordem.data),

        detalheCliente: ordem.cliente || "",

        detalheTelefone: ordem.telefone || "",

        detalheModelo: ordem.modelo || "",

        detalheStatus: ordem.status || "",

        detalheOrcamento: formatarMoedaPDF(ordem.orcamento),

        detalheCusto: formatarMoedaPDF(ordem.custoPeca),

        detalheLucro: formatarMoedaPDF(ordem.lucro),

        detalheFornecedor: ordem.fornecedor || "Não informado",

        detalheGarantia: formatarData(ordem.garantia),

        detalheDefeito:
            ordem.defeito || "Nenhum defeito informado.",

        detalheLaudo:
            ordem.laudo || "Nenhum laudo informado.",

        detalheSubtitulo:
            "OS " + (ordem.os || "") + " - " + (ordem.cliente || "")

    };


    Object.entries(campos).forEach(function([id, valor]){

        const elemento = document.getElementById(id);

        if(elemento){

            elemento.textContent = valor;

        }

    });


    const elementoLucro =
        document.getElementById("detalheLucro");

    if(elementoLucro){

        elementoLucro.classList.toggle(
            "lucro-negativo",
            Number(ordem.lucro || 0) < 0
        );

    }


    abrirModal("modalDetalhesOS");

}


function fecharDetalhesOS(){

    fecharModal("modalDetalhesOS");

}


/* =====================================================
   CONTROLE DOS MODAIS
===================================================== */

let elementoFocoAnterior = null;

function abrirModal(id){

    const modal = document.getElementById(id);

    if(!modal) return;

    elementoFocoAnterior = document.activeElement;

    modal.classList.add("ativo");

    modal.setAttribute("role", "dialog");

    modal.setAttribute("aria-modal", "true");

    modal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

    const conteudo =
        modal.querySelector(".modal-conteudo");

    if(conteudo){

        conteudo.scrollTop = 0;

    }

    const primeiroBotao =
        modal.querySelector(".btn-fechar");

    if(primeiroBotao){

        primeiroBotao.focus();

    }

}


function fecharModal(id){

    const modal = document.getElementById(id);

    if(!modal) return;

    modal.classList.remove("ativo");

    modal.setAttribute("aria-hidden", "true");

    if(!document.querySelector(".modal.ativo")){

        document.body.style.overflow = "";

    }

    if(elementoFocoAnterior && elementoFocoAnterior.isConnected){

        elementoFocoAnterior.focus();

    }

    elementoFocoAnterior = null;

}


/* FECHAR AO CLICAR FORA */

document.querySelectorAll(
    "#modalDetalhesOS, #modalEditarOS"
).forEach(function(modal){

    modal.addEventListener("click", function(evento){

        if(evento.target === modal){

            fecharModal(modal.id);

        }

    });

});


/* FECHAR COM ESC E MANTER FOCO NO MODAL */

document.addEventListener("keydown", function(evento){

    const modal = document.querySelector(".modal.ativo");

    if(!modal) return;

    if(evento.key === "Escape"){

        fecharModal(modal.id);

        return;

    }

    if(evento.key === "Tab"){

        const elementos = Array.from(
            modal.querySelectorAll(
                "button, input, select, textarea, a[href]"
            )
        ).filter(function(elemento){

            return !elemento.disabled &&
                elemento.type !== "hidden" &&
                elemento.getClientRects().length > 0;

        });

        if(!elementos.length) return;

        const primeiro = elementos[0];

        const ultimo = elementos[elementos.length - 1];

        if(evento.shiftKey && document.activeElement === primeiro){

            evento.preventDefault();
            ultimo.focus();

        } else if(!evento.shiftKey &&
            document.activeElement === ultimo){

            evento.preventDefault();
            primeiro.focus();

        }

    }

});


/* =====================================================
   MODAL EDITAR
===================================================== */

function abrirEditarOS(linha){

    const ordem = localizarOrdem(linha);

    if(!ordem){

        alert("Ordem de serviço não encontrada.");

        return;

    }


    const campos = {

        editarLinhaOS: ordem.linha,

        editarNumeroOS: ordem.os,

        editarDataOS: converterDataParaInput(ordem.data),

        editarClienteOS: ordem.cliente,

        editarTelefoneOS: ordem.telefone,

        editarModeloOS: ordem.modelo,

        editarDefeitoOS: ordem.defeito,

        editarLaudoOS: ordem.laudo,

        editarOrcamentoOS: ordem.orcamento,

        editarCustoPecaOS: ordem.custoPeca,

        editarFornecedorOS: ordem.fornecedor,

        editarStatusOS: obterStatusPadrao(ordem.status)

    };


    Object.entries(campos).forEach(function([id, valor]){

        const elemento = document.getElementById(id);

        if(elemento){

            elemento.value = valor ?? "";

        }

    });


    document.getElementById("editarSubtitulo").textContent =

        "OS " + (ordem.os || "") + " - " + (ordem.cliente || "");


    abrirModal("modalEditarOS");

}


function fecharEditarOS(){

    fecharModal("modalEditarOS");

}


/* =====================================================
   SALVAR EDIÇÃO DA OS
===================================================== */

const editarOSForm = document.getElementById("editarOSForm");

if(editarOSForm){

    editarOSForm.addEventListener("submit", async function(evento){

        evento.preventDefault();

        const botao = editarOSForm.querySelector(
            'button[type="submit"]'
        );

        if(botao && botao.disabled){

            return;

        }


        const dados = {

            action: "editarOS",

            linha: document.getElementById("editarLinhaOS").value,

            os: document.getElementById("editarNumeroOS").value,

            data: document.getElementById("editarDataOS").value,

            cliente: document.getElementById("editarClienteOS").value,

            telefone: document.getElementById("editarTelefoneOS").value,

            modelo: document.getElementById("editarModeloOS").value,

            defeito: document.getElementById("editarDefeitoOS").value,

            laudo: document.getElementById("editarLaudoOS").value,

            orcamento: document.getElementById("editarOrcamentoOS").value,

            custoPeca: document.getElementById("editarCustoPecaOS").value,

            fornecedor: document.getElementById("editarFornecedorOS").value,

            status: document.getElementById("editarStatusOS").value

        };


        if(botao){

            botao.disabled = true;

            botao.textContent = "Salvando...";

        }


        try {

            const resposta = await fetch(URL_SCRIPT, {

                method: "POST",

                body: JSON.stringify(dados)

            });

            if(!resposta.ok){

                throw new Error("Erro HTTP " + resposta.status);

            }

            const resultado = await resposta.json();

            if(resultado.sucesso){

                fecharEditarOS();

                await carregarOrdens();

                alert("OS atualizada com sucesso!");

            } else {

                alert(
                    resultado.mensagem ||
                    "Erro ao atualizar OS."
                );

            }

        } catch(erro){

            alert("Erro ao atualizar OS.");

            console.error(erro);

        } finally {

            if(botao){

                botao.disabled = false;

                botao.textContent = "Salvar alterações";

            }

        }

    });

}


/* =====================================================
   WHATSAPP
===================================================== */

function perguntarEnvioWhatsApp(linha){

    const ordem = localizarOrdem(linha);

    if(!ordem){

        alert("Ordem de serviço não encontrada.");

        return;

    }

    const confirmar = confirm(

        "OS finalizada. Deseja avisar o cliente pelo WhatsApp?"

    );

    if(confirmar){

        enviarWhatsAppFinalizado(ordem);

    }

}


function enviarWhatsAppPorLinha(linha){

    const ordem = localizarOrdem(linha);

    if(!ordem){

        alert("Ordem de serviço não encontrada.");

        return;

    }

    const status = normalizarStatus(ordem.status);

    if(status !== "finalizado" && status !== "retirado"){

        const confirmar = confirm(

            "Esta OS ainda não está finalizada. Deseja enviar " +
            "a mensagem de serviço finalizado mesmo assim?"

        );

        if(!confirmar) return;

    }

    enviarWhatsAppFinalizado(ordem);

}


function enviarWhatsAppFinalizado(ordem){

    const telefoneLimpo = String(ordem.telefone || "")
        .replace(/\D/g, "");

    if(!telefoneLimpo){

        alert("Telefone do cliente não encontrado.");

        return;

    }

    let telefoneBrasil;

    if(

        telefoneLimpo.startsWith("55") &&

        (telefoneLimpo.length === 12 ||
         telefoneLimpo.length === 13)

    ){

        telefoneBrasil = telefoneLimpo;

    } else if(

        telefoneLimpo.length === 10 ||

        telefoneLimpo.length === 11

    ){

        telefoneBrasil = "55" + telefoneLimpo;

    } else {

        alert("Confira o telefone e o DDD do cliente.");

        return;

    }


    const valorServico = formatarMoedaPDF(ordem.orcamento);


    const mensagem = `Olá, ${ordem.cliente}! Aqui é da Smartiliza Assistência Técnica.

Sua ordem de serviço nº ${ordem.os}, referente ao aparelho ${ordem.modelo}, foi finalizada e já está pronta para retirada.

Valor total do serviço: ${valorServico}

Aguardamos sua retirada. Obrigado!`;


    const link =

        "https://wa.me/" +

        telefoneBrasil +

        "?text=" +

        encodeURIComponent(mensagem);


    window.open(link, "_blank", "noopener,noreferrer");

}


/* =====================================================
   GERAR PDF PARA O CLIENTE
===================================================== */

function gerarPDFCliente(){

    if(!ordemSelecionadaPDF){

        alert("Nenhuma OS selecionada.");

        return;

    }

    const ordem = ordemSelecionadaPDF;

    const campo = function(titulo, valor){

        return `
            <div class="campo">

                <span>${escaparHTML(titulo)}</span>

                <strong>${escaparHTML(valor)}</strong>

            </div>
        `;

    };


    const htmlPDF = `
        <!DOCTYPE html>
        <html lang="pt-BR">

        <head>

            <meta charset="UTF-8">

            <title>
                OS ${escaparHTML(ordem.os)} - Smartiliza
            </title>

            <style>

                * {
                    box-sizing: border-box;
                    font-family: Arial, sans-serif;
                }

                @page {
                    size: A4;
                    margin: 10mm;
                }

                body {
                    margin: 0;
                    padding: 0;
                    background: #fff;
                    color: #222;
                    font-size: 12px;
                }

                .documento {
                    width: 100%;
                    max-width: 760px;
                    margin: auto;
                }

                .topo {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border-bottom: 2px solid #003B73;
                    padding-bottom: 10px;
                    margin-bottom: 14px;
                }

                .marca h1 {
                    color: #003B73;
                    font-size: 25px;
                    margin: 0;
                }

                .marca span {
                    color: #C65300;
                    font-weight: bold;
                }

                .numero-os {
                    text-align: right;
                }

                .numero-os strong {
                    display: block;
                    font-size: 20px;
                    margin: 4px 0;
                    color: #003B73;
                }

                .secao {
                    margin-bottom: 14px;
                }

                .secao h2 {
                    font-size: 14px;
                    color: #003B73;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 5px;
                    margin: 0 0 9px;
                    break-after: avoid;
                }

                .grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px 16px;
                }

                .campo {
                    min-width: 0;
                    margin-bottom: 4px;
                    break-inside: avoid;
                }

                .campo span {
                    display: block;
                    font-size: 10px;
                    text-transform: uppercase;
                    color: #64748B;
                    font-weight: bold;
                    margin-bottom: 4px;
                }

                .campo strong {
                    font-size: 12px;
                    line-height: 1.4;
                    overflow-wrap: anywhere;
                }

                .texto-longo {
                    background: #F5F8FC;
                    border: 1px solid #D9E2EC;
                    padding: 10px;
                    border-radius: 5px;
                    min-height: 35px;
                    white-space: pre-wrap;
                    overflow-wrap: anywhere;
                    line-height: 1.5;
                }

                .garantia {
                    background: #FFF7ED;
                    border: 1px solid #FDBA74;
                    border-radius: 6px;
                    padding: 10px;
                    margin-top: 12px;
                    break-inside: avoid;
                }

                .garantia h2 {
                    color: #9A3412;
                    font-size: 14px;
                    margin: 0 0 7px;
                }

                .garantia p {
                    margin: 0 0 5px;
                    font-size: 11px;
                    line-height: 1.5;
                }

                .assinaturas {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 35px;
                    margin-top: 40px;
                    break-inside: avoid;
                }

                .assinatura {
                    border-top: 1px solid #222;
                    padding-top: 7px;
                    text-align: center;
                    font-size: 11px;
                }

                .rodape {
                    border-top: 1px solid #ddd;
                    margin-top: 20px;
                    padding-top: 9px;
                    text-align: center;
                    font-size: 10px;
                    line-height: 1.5;
                    color: #64748B;
                }

            </style>

        </head>

        <body>

            <div class="documento">


                <div class="topo">

                    <div class="marca">

                        <h1>Smartiliza</h1>

                        <span>Assistência Técnica</span>

                    </div>

                    <div class="numero-os">

                        Ordem de Serviço

                        <strong>
                            ${escaparHTML(ordem.os)}
                        </strong>

                        <small>
                            Data: ${escaparHTML(formatarData(ordem.data))}
                        </small>

                    </div>

                </div>


                <div class="secao">

                    <h2>Dados do Cliente</h2>

                    <div class="grid">

                        ${campo("Cliente", ordem.cliente)}

                        ${campo("Telefone", ordem.telefone)}

                    </div>

                </div>


                <div class="secao">

                    <h2>Dados do Aparelho</h2>

                    <div class="grid">

                        ${campo("Modelo", ordem.modelo)}

                        ${campo("Status", ordem.status)}

                    </div>

                </div>


                <div class="secao">

                    <h2>Defeito Relatado</h2>

                    <div class="texto-longo">${escaparHTML(
                        ordem.defeito || "Nenhum defeito informado."
                    )}</div>

                </div>


                <div class="secao">

                    <h2>Laudo Técnico / Serviço Realizado</h2>

                    <div class="texto-longo">${escaparHTML(
                        ordem.laudo || "Nenhum laudo informado."
                    )}</div>

                </div>


                <div class="secao">

                    <h2>Valores e Garantia</h2>

                    <div class="grid">

                        ${campo(
                            "Valor do Serviço",
                            formatarMoedaPDF(ordem.orcamento)
                        )}

                        ${campo(
                            "Garantia até",
                            formatarData(ordem.garantia)
                        )}

                    </div>

                </div>


                <div class="garantia">

                    <h2>Termo de Garantia</h2>

                    <p>

                        A garantia cobre apenas o serviço realizado
                        e/ou a peça substituída, dentro do prazo
                        informado nesta OS.

                    </p>

                    <p>

                        Não cobre queda, mau uso, pressão, trinca,
                        contato com líquido, umidade, oxidação/molhado,
                        violação do aparelho, tentativa de reparo por
                        terceiros ou dano físico após a retirada.

                    </p>

                </div>


                <div class="assinaturas">

                    <div class="assinatura">

                        Assinatura do Cliente

                    </div>

                    <div class="assinatura">

                        Responsável Técnico

                    </div>

                </div>


                <div class="rodape">

                    Smartiliza - Assistência Técnica

                    <br>

                    Documento gerado automaticamente
                    pela Central de Serviços.

                </div>


            </div>

        </body>

        </html>
    `;


    const janela = window.open("", "_blank");

    if(!janela){

        alert(
            "Permita a abertura de pop-ups para gerar o PDF."
        );

        return;

    }

    janela.document.open();

    janela.document.write(htmlPDF);

    janela.document.close();

    janela.focus();

    if(janela.document.readyState === "complete"){

        janela.print();

    } else {

        janela.addEventListener("load", function(){

            janela.print();

        }, { once: true });

    }

}


/* =====================================================
   DEFINIR MÊS ATUAL
===================================================== */

function definirMesAtual(){

    const filtroMes =
        document.getElementById("filtroMesDashboard");

    if(!filtroMes){

        return;

    }

    const hoje = new Date();

    const ano = hoje.getFullYear();

    const mes = String(
        hoje.getMonth() + 1
    ).padStart(2, "0");

    filtroMes.value = `${ano}-${mes}`;

}


/* =====================================================
   OBTER ANO E MÊS DE UMA DATA
===================================================== */

function obterAnoMes(data){

    if(!data){

        return "";

    }

    const texto = String(data);

    const formatoISO =
        texto.match(/^(\d{4})-(\d{2})/);

    if(formatoISO){

        return `${formatoISO[1]}-${formatoISO[2]}`;

    }

    const formatoBR =
        texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

    if(formatoBR){

        return `${formatoBR[3]}-${formatoBR[2]}`;

    }

    return "";

}
