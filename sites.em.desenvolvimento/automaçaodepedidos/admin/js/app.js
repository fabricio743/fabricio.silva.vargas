console.log("Painel Administrativo iniciado.");

function logout(){

localStorage.removeItem("logado");

window.location.href =
"login.html";

}

// ===========================
// PRODUTOS
// ===========================

const URL_API =
  "https://script.google.com/macros/s/AKfycbxdjG4PgiTgZTgBqE0PQLAkz9Y5orczm_fttV1LmZLXuQJ9DrPOi_TqXzgA_7Lb7K20/exec";

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
                onclick="editarAgenda('${item.id}')">

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
function editarAgenda(id){

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

        renderizarPedidos(
            pedidos
        );

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

        <div class="pedido-card">

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

        </div>

        `;

    });

}
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

    }catch(erro){

        console.error(
            erro
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
    window.location.pathname
    .includes("pedidos.html")
  ){

      carregarPedidos();

  }