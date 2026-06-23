console.log("Painel Administrativo iniciado.");

function logout(){

localStorage.removeItem("logado");

window.location.href =
"login.html";

}

const URL_API =
  "https://script.google.com/macros/s/AKfycbwo7HpebLglX08p9Gb_KVFbv_Ha5EjXkcNjKx1S9scO_6qR-QLMZB4czIKiC8taMrQ4/exec";

// PRODUTOS
let produtos = [];

function abrirModal(){

    document
        .getElementById(
            "modalProduto"
        )
        .classList.add("active");

}
function fecharModal(){

    document
        .getElementById("modalProduto")
        .classList.remove("active");

    limparFormulario();

}
function limparFormulario(){

    document
        .getElementById("produtoId")
        .value = "";

    document
        .getElementById("nomeProduto")
        .value = "";

    document
        .getElementById("descricaoProduto")
        .value = "";

    document
        .getElementById("precoProduto")
        .value = "";

    document
        .getElementById("estoqueProduto")
        .value = "";

    document
        .getElementById("categoriaProduto")
        .value = "";

}
document.addEventListener(
    "DOMContentLoaded",
    () => {

        if(
            document.getElementById(
                "listaProdutos"
            )
        ){

            carregarProdutos();

        }

    }
);
async function carregarProdutos(){

    try{

        const resposta =
        await fetch(
            URL_API +
            "?action=listarProdutos"
        );

        produtos =
        await resposta.json();

        renderizarProdutos();

    }catch(erro){

        console.error(erro);

        alert(
            "Erro ao carregar produtos."
        );

    }

}
function renderizarProdutos(){

    const lista =
    document.getElementById(
        "listaProdutos"
    );

    lista.innerHTML = "";

    produtos.forEach(produto => {

        lista.innerHTML += `

            <div class="produto-card
                ${produto.status === "ARQUIVADO"
                ? "inativo"
                : ""}">

                <div class="produto-imagem">

                    📷

                </div>

                <h3>
                    ${produto.nome}
                </h3>

                <p>
                    R$ ${produto.preco}
                </p>

                <span>
                    Estoque:
                    ${produto.estoque}
                </span>

                <span>
                    Categoria:
                    ${produto.categoria}
                </span>

                <div
                    class="acoes-produto">

                    <button
                        class="editar"
                        onclick="editarProduto(${produto.id})">

                        Editar

                    </button>

                    <button
                        class="excluir"
                        onclick="alterarStatus(${produto.id})">

                        ${
                            produto.status === "ATIVO"
                            ? "Arquivar"
                            : "Reativar"
                        }

                    </button>

                </div>

            </div>

        `;

    });

}
function editarProduto(id){

    const produto =
    produtos.find(
        p => p.id === id
    );

    if(!produto) return;

    document
        .getElementById("produtoId")
        .value = produto.id;

    document
        .getElementById("nomeProduto")
        .value = produto.nome;

    document
        .getElementById("descricaoProduto")
        .value = produto.descricao;

    document
        .getElementById("precoProduto")
        .value = produto.preco;

    document
        .getElementById("estoqueProduto")
        .value = produto.estoque;

    document
        .getElementById("categoriaProduto")
        .value = produto.categoria;

    document
        .getElementById("tituloModal")
        .innerText =
        "Editar Produto";

    abrirModal()

}
async function alterarStatus(id){

    const produto =
    produtos.find(
        p =>
        String(p.id) ===
        String(id)
    );

    const novoStatus =

        produto.status ===
        "ATIVO"

        ? "ARQUIVADO"

        : "ATIVO";

    try{

        await fetch(
            URL_API,
            {
                method:"POST",
                mode:"no-cors",
                body:JSON.stringify({

                    action:
                    "alterarStatus",

                    id:id,

                    status:
                    novoStatus

                })
            }
        );

        carregarProdutos();

    }catch(erro){

        console.error(erro);

    }

}
async function salvarProduto(){

    const id =
    document
    .getElementById("produtoId")
    .value;

    const produto = {

        action:
        id
        ? "editarProduto"
        : "novoProduto",

        id: id,

        nome:
        document
        .getElementById("nomeProduto")
        .value,

        descricao:
        document
        .getElementById("descricaoProduto")
        .value,

        preco:
        document
        .getElementById("precoProduto")
        .value,

        estoque:
        document
        .getElementById("estoqueProduto")
        .value,

        categoria:
        document
        .getElementById("categoriaProduto")
        .value

    };

    console.log("=== PRODUTO ENVIADO ===");
    console.log(produto);
    console.log("Action:", produto.action);
    console.log("ID:", produto.id);

    try{

        await fetch(
            URL_API,
            {
                method: "POST",
                mode: "no-cors",
                body: JSON.stringify(produto)
            }
        );

        console.log("Requisição enviada.");

        fecharModal();

        carregarProdutos();

    }catch(erro){

        console.error("Erro:", erro);

        alert(
            "Erro ao salvar produto."
        );

    }

}
function criarProdutoLocal(produto){

    produto.id =
    Date.now();

    produtos.push(produto);

}
function atualizarProdutoLocal(
    produtoAtualizado
){

    const index =
    produtos.findIndex(
        p =>
        String(p.id) ===
        String(
            produtoAtualizado.id
        )
    );

    if(index === -1) return;

    produtos[index] =
    produtoAtualizado;

}
function novoProduto(){

    limparFormulario();

    document
        .getElementById(
            "tituloModal"
        )
        .innerText =
        "Novo Produto";

    abrirModal();

}

// AGENDA
let agendaAtual = [];
let agendaEditando = null;
async function salvarAgenda(){

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

        await fetch(
            URL_API,
            {
                method:"POST",
                mode:"no-cors",
                body:JSON.stringify(
                    agenda
                )
            }
        );

        const inputs =
        document.querySelectorAll(
            ".limite-produto"
        );

        for(const input of inputs){

            await fetch(
                URL_API,
                {
                    method:"POST",
                    mode:"no-cors",
                    body:JSON.stringify({

                        action:
                        "salvarProdutosAgenda",

                        idAgenda:
                        agendaId,

                        produtoId:
                        input.dataset.id,

                        limite:
                        input.value

                    })
                }
            );

        }

        alert(
            "Agenda salva com sucesso!"
        );

        agendaEditando = null;

        carregarAgenda();

    }catch(erro){

        console.error(
            erro
        );

        alert(
            "Erro ao salvar agenda."
        );

    }

}
async function carregarAgenda(){

    try{

        const resposta =
        await fetch(
            URL_API +
            "?action=listarAgenda"
        );

        const agenda =
            await resposta.json();

            agendaAtual = agenda;

            renderizarAgenda(
                agenda
            );

    }catch(erro){

        console.error(
            erro
        );

    }

}
function renderizarAgenda(lista){

    const container =
    document.getElementById(
        "listaAgenda"
    );

    if(!container) return;

    container.innerHTML = "";

    lista.forEach(item => {

        container.innerHTML += `

        <div class="agenda-item">

            <h4>
                ${item.data}
            </h4>

            <p>
                Status:
                ${item.status}
            </p>

            <p>
                ${item.horaInicio}
                às
                ${item.horaFim}
            </p>

            <p>
                Limite:
                ${item.limiteHorario}
                pedidos
            </p>

            <div class="agenda-acoes">

                <button
                    class="btn-editar"
                    onclick="editarAgenda('${item.id}', this)">
                    Editar
                </button>

                <button
                class="btn-status"
                onclick="alterarStatusAgenda(
                    '${item.id}',
                    '${item.status}'
                )">

                ${
                    item.status ===
                    "ABERTO"
                    ? "Fechar"
                    : "Abrir"
                }

                </button>

            </div>

        </div>

        `;

    });

}
function editarAgenda(id, botao = null){

    if(botao){

        const textoOriginal =
        botao.innerText;

        botao.classList.add(
            "btn-editando"
        );

        botao.innerText =
        "Editando...";

        setTimeout(() => {

            botao.classList.remove(
                "btn-editando"
            );

            botao.innerText =
            textoOriginal;

        }, 800);

    }

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });
    agendaEditando = id;

    const agenda =
    agendaAtual.find(
        item =>
        String(item.id) ===
        String(id)
    );

    if(!agenda) return;

    document.querySelector(
        'input[type="date"]'
    ).value =
    converterDataInput(
        agenda.data
    );

    document.querySelectorAll(
        "select"
    )[0].value =
    agenda.status;

    document.querySelectorAll(
        'input[type="time"]'
    )[0].value =
    agenda.horaInicio;

    document.querySelectorAll(
        'input[type="time"]'
    )[1].value =
    agenda.horaFim;

    document.querySelectorAll(
        "select"
    )[1].value =
    agenda.intervalo;

    document.querySelector(
        'input[type="number"]'
    ).value =
    agenda.limiteHorario;

    carregarLimitesAgenda(id);

}
async function alterarStatusAgenda(id,statusAtual)
    {

    const novoStatus =
    statusAtual === "ABERTO"
    ? "FECHADO"
    : "ABERTO";

    try{

        await fetch(
            URL_API,
            {
                method:"POST",
                mode:"no-cors",
                body:JSON.stringify({

                    action:
                    "alterarStatusAgenda",

                    id:id,

                    status:
                    novoStatus

                })
            }
        );

        carregarAgenda();

    }catch(erro){

        console.error(
            erro
        );

    }

}
async function carregarProdutosAgenda(){

    try{

        const resposta =
        await fetch(
            URL_API +
            "?action=listarProdutos"
        );

        const produtos =
        await resposta.json();

        renderizarProdutosAgenda(
            produtos
        );

    }catch(erro){

        console.error(
            erro
        );

    }

}
function renderizarProdutosAgenda(produtos){

    const container =
    document.getElementById(
        "produtosAgenda"
    );

    if(!container) return;

    container.innerHTML = "";

    produtos.forEach(produto => {

        if(
            produto.status !==
            "ATIVO"
        ) return;

        container.innerHTML += `

        <div class="produto-agenda">

            <span>

                ${produto.nome}

            </span>

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
function converterDataInput(dataBR){

    const partes =
    dataBR.split("/");

    return `${partes[2]}-${partes[1]}-${partes[0]}`;

}
async function carregarLimitesAgenda(idAgenda){

    try{

        const resposta =
        await fetch(

            URL_API +

            "?action=listarProdutosAgenda" +

            "&idAgenda=" +

            idAgenda

        );

        const limites =
        await resposta.json();

        limites.forEach(item => {

            const input =
            document.querySelector(

                `[data-id="${item.produtoId}"]`

            );

            if(input){

                input.value =
                item.limite;

            }

        });

    }catch(erro){

        console.error(erro);

    }

}

//PEDIDOS
let pedidos = [];

async function carregarPedidos(){

    try{

        const resposta =
        await fetch(
            URL_API +
            "?action=listarPedidos"
        );

        pedidos =
        await resposta.json();

        if(
            typeof filtrarPedidos === "function"
        ){

            filtrarPedidos();

        }else{

            renderizarPedidos(
                pedidos
            );

        }

    }catch(erro){

        console.error(
            erro
        );

    }

}
function renderizarPedidos(lista){

    const container =
    document.getElementById(
        "listaPedidos"
    );

    if(!container) return;

    container.innerHTML = "";

    lista.forEach(pedido => {

        container.innerHTML += `

       <div class="pedido-card ${classeStatusPedido(pedido.status)}">

            <div class="pedido-topo">

                <strong>
                    ${pedido.id}
                </strong>

                <select
                  class="status-select"
                  onchange="
                  alterarStatusPedido(
                  '${pedido.id}',
                  this.value
                  )">

                  <option
                  ${pedido.status==="Recebido"?"selected":""}>
                  Recebido
                  </option>

                  <option
                  ${pedido.status==="Preparando"?"selected":""}>
                  Preparando
                  </option>

                  <option
                  ${pedido.status==="Pronto"?"selected":""}>
                  Pronto
                  </option>

                  <option
                  ${pedido.status==="Entregue"?"selected":""}>
                  Entregue
                  </option>

                  <option
                  ${pedido.status==="Cancelado"?"selected":""}>
                  Cancelado
                  </option>

                </select>

            </div>

            <p>
                👤 ${pedido.cliente}
            </p>

            <p>
                📱 ${pedido.telefone}
            </p>

            <p>
                📅 ${pedido.data}
            </p>

            <p>
                🕒 ${pedido.horario}
            </p>

            <p>
                💳 ${pedido.pagamento}
            </p>

            <p>
                💰 R$ ${pedido.total}
            </p>

            <button
                class="btn-editar"
                onclick="verPedido('${pedido.id}')">

                Detalhes

            </button>
        </div>

        `;

    });

}
function filtrarPedidos(){

    const busca =
    document.getElementById("buscaPedido");

    const filtro =
    document.getElementById("filtroStatus");

    let textoBusca =
    busca ? busca.value.toLowerCase() : "";

    let statusSelecionado =
    filtro ? filtro.value : "";

    const resultado =
    pedidos.filter(pedido => {

        const textoPedido =
        (
            pedido.id + " " +
            pedido.cliente + " " +
            pedido.telefone
        ).toLowerCase();

        const combinaBusca =
        textoPedido.includes(textoBusca);

        const combinaStatus =
        statusSelecionado === "" ||
        pedido.status === statusSelecionado;

        return combinaBusca && combinaStatus;

    });

    renderizarPedidos(resultado);

}
document.addEventListener("input", function(e){

    if(
        e.target.id === "buscaPedido"
    ){

        filtrarPedidos();

    }

});
document.addEventListener("change", function(e){

    if(
        e.target.classList.contains("filtro-status")
    ){

        const todos =
        document.querySelector('.filtro-status[value="Todos"]');

        const outros =
        Array.from(
            document.querySelectorAll('.filtro-status:not([value="Todos"])')
        );

        if(
            e.target.value === "Todos" &&
            e.target.checked
        ){

            outros.forEach(input => {
                input.checked = false;
            });

        }else{

            if(todos){
                todos.checked = false;
            }

        }

        const algumMarcado =
        document.querySelectorAll(".filtro-status:checked").length > 0;

        if(!algumMarcado && todos){
            todos.checked = true;
        }

        filtrarPedidos();

    }

});
async function alterarStatusPedido(
    id,
    status
){

    try{

        await fetch(
            URL_API,
            {
                method:"POST",
                mode:"no-cors",
                body:JSON.stringify({

                    action:
                    "alterarStatusPedido",

                    id:id,

                    status:status

                })
            }
        );
             setTimeout(() => {

            carregarPedidos();

        }, 800);

    }catch(erro){

        console.error(
            erro
        );

    }

}
async function verPedido(idPedido){

    try{

        const resposta =
        await fetch(

            URL_API +
            "?action=listarItensPedido" +
            "&idPedido=" +
            idPedido

        );

        const itens =
        await resposta.json();

        let texto = "";

        itens.forEach(item => {

            texto +=
            item.produto +
            " x" +
            item.quantidade +
            " - R$ " +
            item.preco +
            "\n";

        });

        alert(texto);

    }catch(erro){

        console.error(erro);

    }

}
function filtrarPedidos(){

    const busca =
    document.getElementById("buscaPedido");

    const textoBusca =
    busca ? busca.value.toLowerCase() : "";

    const filtrosMarcados =
    Array.from(
        document.querySelectorAll(".filtro-status:checked")
    ).map(input => input.value);

    const mostrarTodos =
    filtrosMarcados.includes("Todos") ||
    filtrosMarcados.length === 0;

    const resultado =
    pedidos.filter(pedido => {

        const textoPedido =
        (
            pedido.id + " " +
            pedido.cliente + " " +
            pedido.telefone
        ).toLowerCase();

        const combinaBusca =
        textoPedido.includes(textoBusca);

        const combinaStatus =
        mostrarTodos ||
        filtrosMarcados.includes(pedido.status);

        return combinaBusca && combinaStatus;

    });

    renderizarPedidos(resultado);

}
function classeStatusPedido(status){

    const statusFormatado =
    String(status)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");

    return "pedido-" + statusFormatado;

}

let atualizacaoPedidos = null;

function iniciarAtualizacaoPedidos(){

    if(atualizacaoPedidos){
        return;
    }

    atualizacaoPedidos =
    setInterval(() => {

        carregarPedidos();

    }, 10000);

}

//Dashboard
async function carregarDashboard(){

    try{

        const resposta =
        await fetch(
            URL_API +
            "?action=dashboard"
        );

        const dados =
        await resposta.json();

        document
        .getElementById("pedidosHoje")
        .innerText =
        dados.pedidosHoje;

        document
        .getElementById("emProducao")
        .innerText =
        dados.emProducao;

        document
        .getElementById("entreguesHoje")
        .innerText =
        dados.entreguesHoje;

        document
        .getElementById("faturamentoHoje")
        .innerText =
        "R$ " +
        Number(
        dados.faturamentoHoje
        ).toFixed(2);

    }catch(erro){

        console.error(
            erro
        );

    }

}
async function carregarUltimosPedidos(){

    try{

        const resposta =
        await fetch(
            URL_API +
            "?action=ultimosPedidos"
        );

        const pedidos =
        await resposta.json();

        const container =
        document.getElementById(
            "ultimosPedidos"
        );

        if(!container) return;

        container.innerHTML = "";

        pedidos.forEach(pedido => {

            container.innerHTML += `

            <div class="pedido">

                <strong>
                    ${pedido.id}
                </strong>

                <p>
                    ${pedido.cliente}
                </p>

                <small>
                    ${pedido.status}
                    •
                    R$ ${pedido.total}
                </small>

            </div>

            `;

        });

    }catch(erro){

        console.error(
            erro
        );

    }

}
async function carregarGraficoPedidos(){

    try{

        const resposta =
        await fetch(
            URL_API + "?action=pedidosUltimos7Dias",
            {
                method:"GET",
                redirect:"follow"
            }
        );

        const dados =
        await resposta.json();

        const labels =
        Object.keys(dados);

        const valores =
        Object.values(dados);

        const ctx =
        document
        .getElementById(
            "graficoPedidos"
        );

        if(!ctx) return;

        new Chart(ctx, {

            type:"bar",

            data:{

                labels:labels,

                datasets:[{

                    label:
                    "Pedidos",

                    data:valores

                }]

            }

        });

    }catch(erro){

        console.error(
            erro
        );

    }


}

// ESTOQUE

async function carregarEstoque(){

    try{

        const resposta =
        await fetch(
            URL_API +
            "?action=listarProdutos"
        );

        const produtos =
        await resposta.json();

        renderizarEstoque(produtos);

    }catch(erro){

        console.error(erro);

    }

}
function renderizarEstoque(produtos){

    const container =
    document.getElementById("listaEstoque");

    if(!container) return;

    container.innerHTML = "";

    produtos.forEach(produto => {

        if(produto.status !== "ATIVO") return;

        const estoque =
        Number(produto.estoque) || 0;

        const minimo =
        10;

        const percentual =
        Math.min(
            (estoque / minimo) * 100,
            100
        );

        const estoqueBaixo =
        estoque <= minimo;

        container.innerHTML += `

        <div class="estoque-card">

            <h3>
                🍖 ${produto.nome}
            </h3>

            <h1>
                ${estoque}
            </h1>

            <span>
                Estoque Atual
            </span>

            <div class="barra">

                <div
                    class="${estoqueBaixo ? "progresso-baixo" : "progresso"}"
                    style="width:${percentual}%">
                </div>

            </div>

            <p>
                Mínimo: ${minimo}
            </p>

            <div class="${estoqueBaixo ? "status-baixo" : "status-ok"}">

                ${estoqueBaixo
                ? "🔴 Estoque Baixo"
                : "🟢 Estoque Normal"}

            </div>

            <div class="acoes">

                <button
                    onclick="ajustarEstoque('${produto.id}', -1)">
                    -
                </button>

                <button
                    onclick="ajustarEstoque('${produto.id}', 1)">
                    +
                </button>

            </div>

        </div>

        `;

    });

}
async function ajustarEstoque(id, valor){

    try{

        await fetch(
            URL_API,
            {
                method:"POST",
                mode:"no-cors",
                body:JSON.stringify({

                    action:"ajustarEstoque",

                    id:id,

                    valor:valor

                })
            }
        );

        carregarEstoque();

    }catch(erro){

        console.error(erro);

    }

}

// FINANCEIRO

async function carregarFinanceiro(){

    try{

        const resposta =
        await fetch(
            URL_API +
            "?action=financeiro"
        );

        const dados =
        await resposta.json();

        atualizarFinanceiro(
            dados
        );

    }catch(erro){

        console.error(
            erro
        );

    }

}
function formatarMoeda(valor){

    return "R$ " +
    Number(valor || 0)
    .toFixed(2)
    .replace(".", ",");

}
function atualizarFinanceiro(dados){

    const financeiroHoje =
    document.getElementById("financeiroHoje");

    const financeiroSemana =
    document.getElementById("financeiroSemana");

    const financeiroMes =
    document.getElementById("financeiroMes");

    const financeiroPedidos =
    document.getElementById("financeiroPedidos");

    const financeiroPix =
    document.getElementById("financeiroPix");

    const financeiroDinheiro =
    document.getElementById("financeiroDinheiro");

    const financeiroCartao =
    document.getElementById("financeiroCartao");

    if(financeiroHoje){
        financeiroHoje.innerText =
        formatarMoeda(dados.financeiroHoje);
    }

    if(financeiroSemana){
        financeiroSemana.innerText =
        formatarMoeda(dados.financeiroSemana);
    }

    if(financeiroMes){
        financeiroMes.innerText =
        formatarMoeda(dados.financeiroMes);
    }

    if(financeiroPedidos){
        financeiroPedidos.innerText =
        dados.financeiroPedidos;
    }

    if(financeiroPix){
        financeiroPix.innerText =
        formatarMoeda(dados.financeiroPix);
    }

    if(financeiroDinheiro){
        financeiroDinheiro.innerText =
        formatarMoeda(dados.financeiroDinheiro);
    }

    if(financeiroCartao){
        financeiroCartao.innerText =
        formatarMoeda(dados.financeiroCartao);
    }

    renderizarProdutosMaisVendidos(
        dados.produtosMaisVendidos
    );

    renderizarUltimosRecebimentos(
        dados.recebimentos
    );

}
function renderizarProdutosMaisVendidos(lista){

    const container =
    document.getElementById(
        "produtosMaisVendidos"
    );

    if(!container) return;

    container.innerHTML = "";

    lista.forEach(item => {

        container.innerHTML += `

            <li>
                ${item.produto}
                -
                ${item.quantidade}
                vendidos
            </li>

        `;

    });

}
function renderizarUltimosRecebimentos(lista){

    const container =
    document.getElementById(
        "ultimosRecebimentos"
    );

    if(!container) return;

    container.innerHTML = "";

    lista.forEach(item => {

        container.innerHTML += `

            <div class="recebimento">

                ${item.id}
                -
                ${item.cliente}
                -
                ${formatarMoeda(item.total)}
                -
                ${item.pagamento}

            </div>

        `;

    });

}

// CONFIGURAÇÕES

async function carregarConfiguracoes(){

    try{

        const resposta =
        await fetch(
            URL_API +
            "?action=listarConfiguracoes"
        );

        const dados =
        await resposta.json();

        preencherConfiguracoes(
            dados
        );

    }catch(erro){

        console.error(
            erro
        );

    }

}
function preencherConfiguracoes(dados){

    const campos = {
        configNomeEmpresa:"nomeEmpresa",
        configWhatsapp:"whatsapp",
        configTaxaEntrega:"taxaEntrega",
        configPedidoMinimo:"pedidoMinimo",
        configPixNome:"pixNome",
        configPixChave:"pixChave",
        configPixTipo:"pixTipo",
        configStatusLoja:"statusLoja",
        configMaxPedidosHorario:"maxPedidosHorario",
        configTempoHorarios:"tempoHorarios",
        configMensagemConfirmacao:"mensagemConfirmacao"
    };

    Object.keys(campos).forEach(id => {

        const elemento =
        document.getElementById(id);

        if(elemento){

            elemento.value =
            dados[
                campos[id]
            ] || "";

        }

    });

}
async function salvarConfiguracoes(){

    try{

        await fetch(
            URL_API,
            {
                method:"POST",
                mode:"no-cors",
                body:JSON.stringify({

                    action:"salvarConfiguracoes",

                    nomeEmpresa:
                    document.getElementById("configNomeEmpresa").value,

                    whatsapp:
                    document.getElementById("configWhatsapp").value,

                    taxaEntrega:
                    document.getElementById("configTaxaEntrega").value,

                    pedidoMinimo:
                    document.getElementById("configPedidoMinimo").value,

                    pixNome:
                    document.getElementById("configPixNome").value,

                    pixChave:
                    document.getElementById("configPixChave").value,

                    pixTipo:
                    document.getElementById("configPixTipo").value,

                    statusLoja:
                    document.getElementById("configStatusLoja").value,

                    maxPedidosHorario:
                    document.getElementById("configMaxPedidosHorario").value,

                    tempoHorarios:
                    document.getElementById("configTempoHorarios").value,

                    mensagemConfirmacao:
                    document.getElementById("configMensagemConfirmacao").value

                })
            }
        );

        alert(
            "Configurações salvas com sucesso!"
        );

    }catch(erro){

        console.error(
            erro
        );

        alert(
            "Erro ao salvar configurações."
        );

    }

}

if(
        window.location.pathname
        .includes("agenda.html")
    ){

        carregarAgenda();

        carregarProdutosAgenda();

    }

if(
        window.location.pathname
        .includes("agenda.html")
    ){

        carregarAgenda();

    }
if(
    window.location.pathname.includes("pedidos.html")
){

    carregarPedidos();

    iniciarAtualizacaoPedidos();

}
if(
    window.location.pathname
    .includes("estoque.html")
){

    carregarEstoque();

}
if(
    window.location.pathname
    .includes("financeiro.html")
){

    carregarFinanceiro();

}
if(
    window.location.pathname
    .includes("configuracoes.html")
){

    carregarConfiguracoes();

}
if(window.location.pathname.endsWith("/") || window.location.pathname.includes( "index.html")){

    carregarDashboard();

    carregarUltimosPedidos();

    //carregarGraficoPedidos();


}
