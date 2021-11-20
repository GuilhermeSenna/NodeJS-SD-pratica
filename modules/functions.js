const axios = require('axios');

// Checagens básicas no corpo da requisição
function checagens_iniciais(atributos, body) {

    let check = true;
    let mensagem = '';

    // Tenta ler o arquivo req.body
    if (Object.values(body).length === 0) {          // Checa se o JSON está vazio
        check = false;
        mensagem = 'O corpo da requisição está vazio';
    } else {
        Object.keys(body).some(function (key) {      // Similar ao Foreach, mas esse permite retorno.
            if (!key && !body[key]) {                // O conteúdo da mensagem torna auto-explicativo as comparações.
                check = false;
                mensagem = 'Há uma chave e valor vazios.';
            } else if (!key) {
                check = false;
                mensagem = 'Há uma chave vazia';
            } else if (!body[key]) {
                check = false;
                mensagem = `Chave '${key}' com valor vazio.`;
            } else if (!atributos.includes(key)) {       // Checa se o nome da chave é válido
                check = false;
                mensagem = `A chave '${key}' não é válida. Verifique as letras maiúsculas/minúsculas e acentuação.`;
            }
        })
    }

    return ({ check: check, mensagem: mensagem });
}

function retornar_recurso() {
    codigo = uuidv4();
    expiracao = new Date();
    expiracao.setSeconds(expiracao.getSeconds() + 10);
    valor = 1;

    let json = {
        "codigo_de_acesso": codigo,
        "validade": expiracao,
    };

    return (json);
}

function remover_eleicao(id_eleicao, metodo, coordenador, eleicoes) {
    let indice = eleicoes.indexOf(id_eleicao);
    if (indice !== -1) {
        eleicoes.splice(indice, 1);
    }

    enviar_log("Success", `Eleição finalizada (${metodo})`, `A eleição ${id_eleicao} foi finalizada, o novo coordenador agora é ${coordenador}.`);

    return eleicoes;
}

async function pegar_infos(ativos_filtrados) {
    // Lista das infos de todos os participantes ativos
    var lista_de_infos = [];

    // Espera acabar todas as promises
    await Promise.all(

        // Map de todos os peers ativos atualmente
        ativos_filtrados.map(async (ativo) => {
            // Retorno da função aonde é feito a requisição das infos
            const info_ = await get_info(ativo);

            // Adiciona a info obtida na lista de infos
            if (info_) {
                lista_de_infos.push(info_);
            }

        })
    )
        // Caso não encontre erros, retorna a lista de infos +ID
        .then(function () {
            // console.log(lista_de_infos);
            // return ("lista_de_infos");
        })

        // Caso encontre erros, motra a URL aonde ocorreu o erro.
        .catch(function (err) {
            // console.log(err);
            // if (err.hostname) {
            //     res.status(400).json({ status: 400, message: `Erro ao tentar obter o info de: ${err.hostname}` });
            // } else {
            //     res.status(400).json({ status: 400, message: `Erro desconhecido ao tentar obter o` });
            // }

        });
    return (lista_de_infos);
}


async function get_info(ativo) {
    // Requisição para a URL do parcipante + a rota desejada (info)
    try {
        const resp = await axios.get(ativo.url + "info");

        if (resp.status == 200) {
            // Adiciona o ID do participante na lista de infos
            resp.data.id = ativo.id;

            // Retorna a info + ID
            return resp.data;
        } else {
            enviar_log("Warning", `/info HTTP Status diferente de 200`, `O HTTP Status de ${ativo.url} é ${resp.data} e não 200, será desconsiderado na eleição.`);
            return ([]);
        }
    } catch (e) {
        enviar_log("Warning", `/info indisponível`, `Erro ao tentar obter o /info de '${ativo.nome}' - '${ativo.url}', confira a URL para ver está correta. Será desconsiderado da eleição.`);
        return ([]);
    }

}

async function enviar_log(severidade, resumo, comentario) {
    let mensagem_log =
    {
        "from": "https://nodejs-sd-guilhermesenna.herokuapp.com/",
        "severity": severidade,
        "comment": resumo,
        "body": comentario
    }

    await axios.post('https://sd-log-server.herokuapp.com/log', mensagem_log);
}

function horario_atual() {
    var data = new Date();

    var hor = data.getHours();
    hor = (hor < 10 ? "0" : "") + hor;

    var min = data.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var seg = data.getSeconds();
    seg = (seg < 10 ? "0" : "") + seg;

    return (hor + ":" + min + ":" + seg);
}

function gerar_id_eleicao() {

    var data = new Date();

    dia = data.getDate().toString().padStart(2, '0');
    mes = (data.getMonth() + 1).toString().padStart(2, '0'); //+1 pois no getMonth Janeiro começa com zero.

    var hor = data.getHours();
    hor = (hor < 10 ? "0" : "") + hor;

    var min = data.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var seg = data.getSeconds();
    seg = (seg < 10 ? "0" : "") + seg;

    // Geração do código da eleição
    return (`201710376-${dia}${mes}-${hor}${min}${seg}`);

}

module.exports = { checagens_iniciais, retornar_recurso, remover_eleicao, pegar_infos, enviar_log, horario_atual, gerar_id_eleicao };