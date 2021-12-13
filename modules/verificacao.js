const functions = require("../modules/functions");
// const fs = require('fs');
const fs = require('fs').promises;
const axios = require('axios');

let coordenador, is_election_on;

function atualizar_valores(cd, ie) {

    coordenador = cd;
    is_election_on = ie;
}

async function ler_arquivo() {
    try {
        const data = await fs.readFile("info.json");
        return new Buffer.from(data);
    } catch (e) {
        return ('');
    }

}


// Verificacao contínua se o coordenador está online
const verificacao = async (ativos) => {
    function sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    while (true) {
        // Voltar depois
        // let coordenador = await axios.get("https://nodejs-sd-guilhermesenna.herokuapp.com/coordenador");
        // let coordenador = await axios.get("http://localhost:8000/coordenador");
        // coordenador = coordenador.data.coordenador_atual;

        // let mensagem_log =
        // {
        //     "from": "nodejs-sd-guilhermesenna.herokuapp",
        //     "severity": "Success",
        //     "comment": "1ª verificação (2 segundos)",
        //     "body": "Realizando 1ª verificação para saber se o coordenador está ativo."
        // }

        // axios.post('https://sd-log-server.herokuapp.com/log', mensagem_log);


        console.log(`[${functions.horario_atual()}] (1ª verificação coordenador) aguardando 2 segundos...`);
        await sleep(2000);

        let verificar = false;

        if (coordenador == -1) { // -1 é o número quando o servidor inicia pela primeira vez
            // Avisar da flag
            verificar = true;
        } else if (coordenador == '201710376') { // Se o coordenador for eu

            // Lê o info
            let leitura = await ler_arquivo();

            // Caso retorne com sucesso
            if (leitura) {
                // Trata o JSON
                leitura = JSON.parse(leitura);

                // Se estiver offline
                if (leitura.status == 'offline') {
                    verificar = true;
                }
            } else {
                // Erro na leitura do arquivo
                functions.enviar_log("Critical", `Primeira verificação - Erro de leitura no arquivo`, `O coordenador armazenado é 201710376 (eu), porém houve erro ao ler o arquivo do info, por favor me informe.`);
            }
        } else { // Se o coordenador for outro 
            // Verificar na lista de ativos
            var ativo = ativos.filter(ativo_ => ativo_.id == coordenador);

            // console.log(ativo);

            if (ativo.length) { // Caso esteja na lista de ativos
                let info_peer = await functions.get_info(ativo[0], "Primeira verificação");

                // console.log(info_peer);

                if (info_peer) {
                    // Caso esteja offline
                    if (info_peer.status == 'offline') {
                        verificar = true;
                    }
                }


            } else { // Caso não esteja na lista de ativos
                functions.enviar_log("Warning", `Primeira verificação - Coordenador não listado`, `O coordenador informado '${coordenador}', não está presente na lista de ativos, favor avisar para inserir (caso exista).`);
            }
        }

        console.log(` -> Coordenador: ${coordenador} / Eleição ativa? - ${is_election_on}`)

        if (verificar && !is_election_on) {

            let minimo = 5;
            let maximo = 10;
            let timer_gerado = (Math.floor(Math.random() * (maximo - minimo + 1)) + minimo);
            console.log(`[${functions.horario_atual()}] (2ª verificação coordenador) aguardando ${timer_gerado} segundos para testar novamente!`);

            // let mensagem_log =
            // {
            //     "from": "nodejs-sd-guilhermesenna.herokuapp",
            //     "severity": "Success",
            //     "comment": `2ª verificação (${timer_gerado} segundos)`,
            //     "body": "Realizando 2ª verificação para confirmar se o coordenador está ativo."
            // }

            // axios.post('https://sd-log-server.herokuapp.com/log', mensagem_log);

            // Checar de novo se o coordenado está ativo
            await sleep(timer_gerado * 1000);

            verificar = false;

            if (coordenador == -1) { // -1 é o número quando o servidor inicia pela primeira vez
                // Avisar da flag
                verificar = true;
            } else if (coordenador == '201710376') { // Se o coordenador for eu

                // Lê o info
                let leitura = await ler_arquivo();

                // Caso retorne com sucesso
                if (leitura) {
                    // Trata o JSON
                    leitura = JSON.parse(leitura);

                    // Se estiver offline
                    if (leitura.status == 'offline') {
                        verificar = true;
                    }
                } else {
                    // Erro na leitura do arquivo
                    functions.enviar_log("Critical", `Segunda verificação - Erro de leitura no arquivo`, `O coordenador armazenado é 201710376 (eu), porém houve erro ao ler o arquivo do info, por favor me informe.`);
                }
            } else { // Se o coordenador for outro 
                // Verificar na lista de ativos
                var ativo = ativos.filter(ativo_ => ativo_.id == coordenador);

                if (ativo.length) { // Caso esteja na lista de ativos
                    let info_peer = await functions.get_info(ativo[0], "Segunda verificação");

                    if (info_peer) {
                        // Caso esteja offline
                        if (info_peer.status == 'offline') {
                            verificar = true;
                        }
                    }

                } else { // Caso não esteja na lista de ativos
                    functions.enviar_log("Warning", `Segunda verificação - Coordenador não listado`, `O coordenador informado '${coordenador}', não está presente na lista de ativos, favor avisar para inserir (caso exista).`);
                }
            }

            // if coordenador == offline
            if (verificar && !is_election_on) {

                // Lê o info
                let leitura = await ler_arquivo();

                // Caso retorne com sucesso
                if (leitura) {
                    // Trata o JSON
                    leitura = JSON.parse(leitura);

                    let tipo_eleicao = leitura.tipo_de_eleicao_ativa;

                    if (tipo_eleicao != 'valentao' && tipo_eleicao != 'anel') {
                        functions.enviar_log("Critical", `Coordenador OFFLINE - Tipo de eleição inválido`, `O coordenador '${coordenador}' foi confirmado offline, porém a eleição não poderá ser iniciada pois o tipo de eleicão está como '${tipo_eleicao}' que não é um valor válido. Os valores possíveis são 'anel' ou 'valentao'. Tudo minúsculo e sem acento. A eleição só poderá ser iniciada quando houver um tipo de eleição válido no /info.`);
                    } else {
                        // functions.enviar_log("Success", `Iniciando nova eleição (Coordenador OFFLINE)`, `O coordenador '${coordenador}' foi confirmado offline, a eleição ocorrerá pelo algoritmo do '${tipo_eleicao}'.`);

                        const lancar_eleicao = async () => {

                            let body =
                            {
                                "id": functions.gerar_id_eleicao(),
                                "dados": [],
                            }

                            const url = 'https://nodejs-sd-guilhermesenna.herokuapp.com/eleicao';
                            // const url = 'http://localhost:8000/eleicao';

                            const resp = await axios.post(url, body);

                            if (resp.status != 200) {
                                functions.enviar_log("Error", `Erro ao iniciar uma nova eleição`, `Ocorreu um erro ao se tentar iniciar uma nova eleição. Verifique o [POST] /eleicao.`);
                            } else {
                                is_election_on = true;
                            }
                        }

                        await lancar_eleicao();
                    }


                } else {
                    // Erro na leitura do arquivo
                    functions.enviar_log("Error", `Coordenador OFFLINE - Info indisponível`, `O coordenador ${coordenador} foi confirmado offline, porém houve um erro ao tentar ler o arquivo com o info. Verifique o /info e/ou me contate. A eleição não poderá ser iniciada até que se resolva esse erro.`);
                }


                // console.log(`[${functions.horario_atual()}] (Coordenador OFFLINE) iniciando uma nova eleição!`);
            }

        }
    }
}

module.exports = { verificacao, atualizar_valores };