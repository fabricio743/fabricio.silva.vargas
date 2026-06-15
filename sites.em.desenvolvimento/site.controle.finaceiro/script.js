const URL_API = "https://script.google.com/macros/s/AKfycbwHL-5ENw92SJxGqRisOY2f77-N2O5_RHvufAa8RHotMC7Kc4XWjmla4HzmN956_CnokA/exec";

let lancamentos = [];

const grafico = new Chart(
document.getElementById("grafico"),
{
type:"pie",

data:{
labels:["Entradas","Saídas"],
datasets:[{
data:[0,0]
}]
}
}
);

function adicionarLancamento(){

const item = {

data:
document.getElementById("data").value,

tipo:
document.getElementById("tipo").value,

local:
document.getElementById("local").value,

descricao:
document.getElementById("descricao").value,

observacoes:
document.getElementById("observacoes").value,

valor:
parseFloat(
document.getElementById("valor").value
),

pagamento:
document.getElementById("pagamento").value

};

lancamentos.push(item);

atualizarTabela();
atualizarDashboard();

document.getElementById("formulario").reset();
}

function excluirLancamento(index){

  if(confirm("Deseja remover este lançamento?")){

    lancamentos.splice(index, 1);

    atualizarTabela();
    atualizarDashboard();

  }

}

function atualizarTabela(){

  const tabela =
  document.getElementById("tabela");

  tabela.innerHTML = "";

  lancamentos.forEach((item,index) => {

    tabela.innerHTML += `
      <tr>
        <td>${item.data}</td>
        <td>${item.tipo}</td>
        <td>${item.local}</td>
        <td>R$ ${item.valor.toFixed(2)}</td>

        <td>
          <button
            class="btn-excluir"
            onclick="excluirLancamento(${index})">
            🗑️
          </button>
        </td>
      </tr>
    `;

  });

}

function atualizarDashboard(){

let entradas = 0;
let saidas = 0;

lancamentos.forEach(item => {

if(item.tipo === "Entrada")
entradas += item.valor;

else
saidas += item.valor;

});

document.getElementById(
"totalEntradas"
).innerText =
`R$ ${entradas.toFixed(2)}`;

document.getElementById(
"totalSaidas"
).innerText =
`R$ ${saidas.toFixed(2)}`;

document.getElementById(
"saldo"
).innerText =
`R$ ${(entradas-saidas).toFixed(2)}`;

grafico.data.datasets[0].data =
[
entradas,
saidas
];

grafico.update();

}

document.getElementById("enviar")
.addEventListener("click", async ()=>{

if(lancamentos.length === 0){

alert("Nenhum lançamento.");

return;

}

try{

await fetch(URL_API,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(
lancamentos
)

});

alert("Enviado com sucesso!");

lancamentos = [];

atualizarTabela();
atualizarDashboard();

}catch{

alert("Erro ao enviar.");

}

});