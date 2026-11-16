
/* =====================================================
   GESTÃO DE TRABALHOS
   DETALHES DO TRABALHO
===================================================== */

const $ = id => document.getElementById(id);


/* =====================================================
   FUNÇÕES AUXILIARES
===================================================== */

function dinheiro(valor) {

    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}


function escaparHTML(valor) {

    return String(valor ?? "").replace(/[&<>"']/g, caractere => {

        const entidades = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entidades[caractere];

    });

}


function formatarData(valor) {

    if (!valor) return "—";

    const texto = String(valor);

    let data;

    if (/^\d{4}-\d{2}-\d{2}/.test(texto)) {

        const [ano, mes, dia] = texto.substring(0, 10).split("-");

        return `${dia}/${mes}/${ano}`;

    }

    data = new Date(valor);

    if (Number.isNaN(data.getTime())) return "—";

    return data.toLocaleDateString("pt-BR");

}


function classeStatus(status) {

    const classes = {
        "Em andamento": "andamento",
        "Aguardando aprovação": "aprovacao",
        "Aguardando peça": "peca",
        "Concluído": "concluido",
        "Entregue": "entregue",
        "Cancelado": "cancelado"
    };

    return classes[status] || "andamento";

}


/* =====================================================
   IDENTIFICAR TRABALHO
===================================================== */

function obterIdTrabalho() {

    const parametros = new URLSearchParams(
        window.location.search
    );

    return parametros.get("id");

}


/* =====================================================
   RENDERIZAR DETALHES
===================================================== */

function renderizarDetalhes(trabalho) {

    const custos = Array.isArray(trabalho.custos)
        ? trabalho.custos
        : [];

    const pagamentos = Array.isArray(trabalho.pagamentos)
        ? trabalho.pagamentos
        : [];

    const status = escaparHTML(trabalho.status || "Sem status");

    const classe = classeStatus(trabalho.status);

    const totalCustos = Number(trabalho.totalCustos || 0);
    const totalRecebido = Number(trabalho.totalRecebido || 0);
    const pendente = Number(trabalho.pendente || 0);
    const lucro = Number(trabalho.lucro || 0);

    $("conteudoDetalhes").innerHTML = `

        <div class="detalhe-cabecalho panel">

            <div>
                <span class="detalhe-legenda">CLIENTE</span>
                <h2>${escaparHTML(trabalho.cliente)}</h2>
                <p>${escaparHTML(trabalho.servico)}</p>
            </div>

            <span class="status-badge ${classe}">
                ${status}
            </span>

        </div>


        <div class="detalhe-grid">

            <div class="panel detalhe-card">
                <span>VALOR DO SERVIÇO</span>
                <strong>${dinheiro(trabalho.valorServico)}</strong>
            </div>

            <div class="panel detalhe-card">
                <span>TOTAL RECEBIDO</span>
                <strong class="valor-recebido">
                    ${dinheiro(totalRecebido)}
                </strong>
            </div>

            <div class="panel detalhe-card">
                <span>SALDO PENDENTE</span>
                <strong class="valor-pendente">
                    ${dinheiro(pendente)}
                </strong>
            </div>

            <div class="panel detalhe-card">
                <span>LUCRO DO TRABALHO</span>
                <strong>${dinheiro(lucro)}</strong>
            </div>

        </div>


        <div class="panel detalhe-secao">

            <h3>Informações do serviço</h3>

            <div class="detalhe-informacoes">

                <div>
                    <span>Cliente</span>
                    <strong>${escaparHTML(trabalho.cliente)}</strong>
                </div>

                <div>
                    <span>Telefone</span>
                    <strong>${escaparHTML(trabalho.telefone || "—")}</strong>
                </div>

                <div>
                    <span>Categoria</span>
                    <strong>${escaparHTML(trabalho.categoria || "—")}</strong>
                </div>

                <div>
                    <span>Serviço</span>
                    <strong>${escaparHTML(trabalho.servico)}</strong>
                </div>

                <div>
                    <span>Data do trabalho</span>
                    <strong>${formatarData(trabalho.data)}</strong>
                </div>

                <div>
                    <span>Data de criação</span>
                    <strong>${formatarData(trabalho.dataCriacao)}</strong>
                </div>

            </div>

            <div class="detalhe-observacoes">
                <span>Observações</span>
                <p>${escaparHTML(trabalho.observacoes || "Nenhuma observação registrada.")}</p>
            </div>

        </div>


        <div class="panel detalhe-secao">

            <h3>Custos do trabalho</h3>

            <div class="tabela-responsiva">

                <table class="tabela-detalhes">

                    <thead>
                        <tr>
                            <th>Descrição</th>
                            <th>Valor</th>
                        </tr>
                    </thead>

                    <tbody>

                        ${custos.length ? custos.map(custo => `

                            <tr>
                                <td>${escaparHTML(custo.descricao)}</td>
                                <td>${dinheiro(custo.valor)}</td>
                            </tr>

                        `).join("") : `

                            <tr>
                                <td colspan="2">Nenhum custo registrado.</td>
                            </tr>

                        `}

                    </tbody>

                    <tfoot>
                        <tr>
                            <th>Total de custos</th>
                            <th>${dinheiro(totalCustos)}</th>
                        </tr>
                    </tfoot>

                </table>

            </div>

        </div>


        <div class="panel detalhe-secao">

            <h3>Histórico de pagamentos</h3>

            <div class="tabela-responsiva">

                <table class="tabela-detalhes">

                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Forma de pagamento</th>
                            <th>Observação</th>
                            <th>Valor</th>
                        </tr>
                    </thead>

                    <tbody>

                        ${pagamentos.length ? pagamentos.map(pagamento => `

                            <tr>
                                <td>${formatarData(pagamento.data)}</td>
                                <td>${escaparHTML(pagamento.forma || "—")}</td>
                                <td>${escaparHTML(pagamento.observacao || "—")}</td>
                                <td class="valor-recebido">
                                    ${dinheiro(pagamento.valor)}
                                </td>
                            </tr>

                        `).join("") : `

                            <tr>
                                <td colspan="4">Nenhum pagamento registrado.</td>
                            </tr>

                        `}

                    </tbody>

                    <tfoot>
                        <tr>
                            <th colspan="3">Total recebido</th>
                            <th>${dinheiro(totalRecebido)}</th>
                        </tr>
                    </tfoot>

                </table>

            </div>

        </div>

    `;

}


/* =====================================================
   CARREGAR DETALHES
===================================================== */

async function carregarDetalhes() {

    const id = obterIdTrabalho();

    const conteudo = $("conteudoDetalhes");

    if (!id) {

        conteudo.innerHTML = `
            <div class="panel">
                <p class="empty-state">
                    Nenhum trabalho foi selecionado.
                </p>
            </div>
        `;

        return;

    }

    try {

        const resposta = await apiGet("obterTrabalho", { id });

        if (!resposta || !resposta.sucesso) {

            throw new Error(
                resposta?.mensagem || "Não foi possível carregar o trabalho."
            );

        }

        $("btnEditarTrabalho").href =
            `trabalho.html?id=${encodeURIComponent(resposta.trabalho.id)}`;

        renderizarDetalhes(resposta.trabalho);

    } catch (erro) {

        console.error("Erro ao carregar detalhes:", erro);

        conteudo.innerHTML = `
            <div class="panel">
                <p class="empty-state">
                    ${escaparHTML(erro.message)}
                </p>
            </div>
        `;

    }

}


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    carregarDetalhes();

});
