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
  "https://script.google.com/macros/s/AKfycbwktTpX0gwtoZBAJgvjL12dNnmBgCQpDQQXIfdUm_pyxLBaDpnt_96dzsaG555EkwBv/exec";

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
async function salvarAgenda(){

    const agendaId =
    String(new Date().getTime());

    const agenda = {

        action:"salvarAgenda",

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
function editarAgenda(dados){

  const aba =
  SpreadsheetApp
  .getActiveSpreadsheet()
  .getSheetByName("AGENDA");

  const linhas =
  aba.getDataRange()
  .getValues();

  let encontrou = false;

  for(let i = 1; i < linhas.length; i++){

    const idPlanilha =
    String(linhas[i][0]).trim();

    const idRecebido =
    String(dados.id).trim();

    if(idPlanilha === idRecebido){

      encontrou = true;

      aba.getRange(i+1,2)
      .setValue(dados.data);

      aba.getRange(i+1,3)
      .setValue(dados.status);

      aba.getRange(i+1,4)
      .setValue(dados.horaInicio);

      aba.getRange(i+1,5)
      .setValue(dados.horaFim);

      aba.getRange(i+1,6)
      .setValue(dados.intervalo);

      aba.getRange(i+1,7)
      .setValue(dados.limiteHorario);

      break;

    }

  }

  return ContentService
  .createTextOutput(
    JSON.stringify({
      sucesso: encontrou
    })
  )
  .setMimeType(
    ContentService.MimeType.JSON
  );

}
function alterarStatusAgenda(dados){

  const aba =
  SpreadsheetApp
  .getActiveSpreadsheet()
  .getSheetByName("AGENDA");

  const linhas =
  aba.getDataRange()
  .getValues();

  let encontrou = false;

  for(let i = 1; i < linhas.length; i++){

    const idPlanilha =
    String(linhas[i][0]).trim();

    const idRecebido =
    String(dados.id).trim();

    if(idPlanilha === idRecebido){

      encontrou = true;

      aba
      .getRange(i+1,3)
      .setValue(dados.status);

      break;

    }

  }

  return ContentService
  .createTextOutput(
    JSON.stringify({
      sucesso: encontrou
    })
  )
  .setMimeType(
    ContentService.MimeType.JSON
  );

}
function editarAgenda(id){

    const agenda =
    agendaAtual.find(
        a => String(a.id) === String(id)
    );

    if(!agenda) return;

    document.querySelector(
        'input[type="date"]'
    ).value = agenda.data;

    document.querySelectorAll(
        'input[type="time"]'
    )[0].value =
    agenda.horaInicio;

    document.querySelectorAll(
        'input[type="time"]'
    )[1].value =
    agenda.horaFim;

}
async function alterarStatusAgenda(
    id,
    statusAtual
){

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
function salvarProdutosAgenda(dados){

  const aba =
  SpreadsheetApp
  .getActiveSpreadsheet()
  .getSheetByName(
    "AGENDA_PRODUTOS"
  );

  aba.appendRow([

    dados.idAgenda,

    dados.produtoId,

    dados.limite

  ]);

  return ContentService
  .createTextOutput(
    JSON.stringify({
      sucesso:true
    })
  )
  .setMimeType(
    ContentService.MimeType.JSON
  );

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