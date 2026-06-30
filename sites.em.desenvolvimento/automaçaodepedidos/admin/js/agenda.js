// AGENDA
let agendaAtual = [];
let agendaEditando = null;
let salvandoAgenda = false;

document.addEventListener("DOMContentLoaded", () => {
    carregarAgenda();
    carregarProdutosAgenda();
});

async function salvarAgenda(){

    if(salvandoAgenda){
        return;
    }

    salvandoAgenda = true;

    bloquearSalvarAgenda();

    const agendaId =
        agendaEditando ||
        String(new Date().getTime());

    const agenda = {

        action:
            agendaEditando
            ? "atualizarAgenda"
            : "salvarAgenda",

        id:agendaId,

        data:
        document.querySelector(
            'input[type="date"]'
        ).value,

        status:
        document.querySelectorAll(
            "select"
        )[0].value,

        horaInicio:
        document.querySelectorAll(
            'input[type="time"]'
        )[0].value,

        horaFim:
        document.querySelectorAll(
            'input[type="time"]'
        )[1].value,

        intervalo:
        document.querySelectorAll(
            "select"
        )[1].value,

        limiteHorario:
        document.querySelector(
            'input[type="number"]'
        ).value

    };

    try{

        await enviarParaPlanilha(agenda);

        const inputs =
        document.querySelectorAll(
            ".limite-produto"
        );

        for(const input of inputs){

            await enviarParaPlanilha({

                action:
                "salvarProdutosAgenda",

                idAgenda:
                agendaId,

                produtoId:
                input.dataset.id,

                limite:
                input.value

            });

        }

        agendaEditando = null;

        await carregarAgenda();

        alert(
            "Agenda salva com sucesso!"
        );

    }catch(erro){

        console.error(
            erro
        );

        alert(
            "Erro ao salvar agenda."
        );

    }finally{

        salvandoAgenda = false;

        liberarSalvarAgenda();

    }

}

async function carregarAgenda() {
    try {
        const agenda = await buscarNaPlanilha("listarAgenda");

        agendaAtual = agenda;

        renderizarAgenda(agenda);

    } catch (erro) {
        console.error(erro);
    }
}

function renderizarAgenda(lista) {
    const container = document.getElementById("listaAgenda");

    if (!container) return;

    container.innerHTML = "";

    lista.forEach(item => {
        container.innerHTML += `

            <div class="agenda-item">

                <h4>${item.data}</h4>

                <p>Status: ${item.status}</p>

                <p>${item.horaInicio} às ${item.horaFim}</p>

                <p>Limite: ${item.limiteHorario} pedidos</p>

                <div class="agenda-acoes">

                    <button
                        class="btn-editar"
                        onclick="editarAgenda('${item.id}', this)">
                        Editar
                    </button>

                    <button
                        class="btn-status"
                        onclick="alterarStatusAgenda('${item.id}', '${item.status}')">
                        ${
                            item.status === "ABERTO"
                            ? "Fechar"
                            : "Abrir"
                        }
                    </button>

                </div>

            </div>

        `;
    });
}

function editarAgenda(id, botao = null) {
    if (botao) {
        const textoOriginal = botao.innerText;

        botao.classList.add("btn-editando");
        botao.innerText = "Editando...";

        setTimeout(() => {
            botao.classList.remove("btn-editando");
            botao.innerText = textoOriginal;
        }, 800);
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    agendaEditando = id;

    const agenda = agendaAtual.find(item => String(item.id) === String(id));

    if (!agenda) return;

    document.querySelector('input[type="date"]').value =
        converterDataInput(agenda.data);

    document.querySelectorAll("select")[0].value =
        agenda.status;

    document.querySelectorAll('input[type="time"]')[0].value =
        agenda.horaInicio;

    document.querySelectorAll('input[type="time"]')[1].value =
        agenda.horaFim;

    document.querySelectorAll("select")[1].value =
        agenda.intervalo;

    document.querySelector('input[type="number"]').value =
        agenda.limiteHorario;

    carregarLimitesAgenda(id);

    const btnSalvar =
    document.getElementById("btnSalvarAgenda");

    if(btnSalvar){
        btnSalvar.innerText = "Atualizar Agenda";
    }
}

async function alterarStatusAgenda(id, statusAtual) {
    const novoStatus =
        statusAtual === "ABERTO"
        ? "FECHADO"
        : "ABERTO";

    try {
        await enviarParaPlanilha({
            action: "alterarStatusAgenda",
            id: id,
            status: novoStatus
        });

        carregarAgenda();

    } catch (erro) {
        console.error(erro);
    }
}

async function carregarProdutosAgenda() {
    try {
        const produtos = await buscarNaPlanilha("listarProdutos");

        renderizarProdutosAgenda(produtos);

    } catch (erro) {
        console.error(erro);
    }
}

function renderizarProdutosAgenda(produtos) {
    const container = document.getElementById("produtosAgenda");

    if (!container) return;

    container.innerHTML = "";

    produtos.forEach(produto => {
        if (produto.status !== "ATIVO") return;

        container.innerHTML += `

            <div class="produto-agenda">

                <span>${produto.nome}</span>

                <input
                    type="number"
                    min="0"
                    value="0"
                    class="limite-produto"
                    data-id="${produto.id}"
                >

            </div>

        `;
    });
}

function converterDataInput(dataBR) {
    const partes = dataBR.split("/");

    return `${partes[2]}-${partes[1]}-${partes[0]}`;
}

async function carregarLimitesAgenda(idAgenda) {
    try {
        const limites = await buscarNaPlanilha("listarProdutosAgenda", {
            idAgenda: idAgenda
        });

        limites.forEach(item => {
            const input = document.querySelector(`[data-id="${item.produtoId}"]`);

            if (input) {
                input.value = item.limite;
            }
        });

    } catch (erro) {
        console.error(erro);
    }
}

function bloquearSalvarAgenda(){

    const btn =
    document.getElementById("btnSalvarAgenda");

    if(btn){

        btn.disabled = true;
        btn.innerText = "Salvando...";

    }

    document.body.classList.add("salvando-agenda");

}

function liberarSalvarAgenda(){

    const btn =
    document.getElementById("btnSalvarAgenda");

    if(btn){

        btn.disabled = false;

        btn.innerText =
        agendaEditando
        ? "Atualizar Agenda"
        : "Salvar Agenda";

    }

    document.body.classList.remove("salvando-agenda");

}