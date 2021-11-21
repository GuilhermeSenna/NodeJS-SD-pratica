const functions = require("../modules/functions");
const fs = require('fs');
const axios = require('axios');

// Verificacao contínua se o coordenador está online
const verificacao = async () => {
    function sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    while (true) {

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

        // if coordenador == offline
        if (true) {
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

            // if coordenador == offline
            if (true) {

                fs.readFile('info.json', function (err, data) {

                    try {
                        let temp = JSON.parse(data.toString());
                        var tipo_eleicao = temp.tipo_de_eleicao_ativa;
                    } catch (e) {
                        // Esse erro provavelmente é com o arquivo
                        // Será informado no Log.
                    }


                    if (!err) {           // Se não houver erros...
                        if (tipo_eleicao != 'valentao' && tipo_eleicao != 'anel') {
                            functions.enviar_log("Critical", `Coordenador OFFLINE - Tipo de eleição inválido`, `O coordenador X foi confirmado offline, porém a eleição não poderá ser iniciada pois o tipo de eleicão está como '${tipo_eleicao}' que não é um valor válido. Os valores possíveis são 'anel' ou 'valentao'. Tudo minúsculo e sem acento. A eleição só poderá ser iniciada quando houver um tipo de eleição válido no /info.`);
                        } else {
                            functions.enviar_log("Success", `Iniciando nova eleição (Coordenador OFFLINE)`, `O coordenador X foi confirmado offline, a eleição ocorrerá pelo algoritmo do ${tipo_eleicao}.`);

                            const lancar_eleicao = async () => {

                                let body =
                                {
                                    "id": functions.gerar_id_eleicao(),
                                    "dados": "Eleição gerada por o coordenador X ser detectado como OFFLINE",
                                }

                                const url = 'https://nodejs-sd-guilhermesenna.herokuapp.com/eleicao';
                                // const url = 'http://localhost:8000/eleicao';

                                const resp = await axios.post(url, body);

                                if (resp.status != 200) {
                                    functions.enviar_log("Error", `Erro ao iniciar uma nova eleição`, `Ocorreu um erro ao se tentar iniciar uma nova eleição. Verifique o [POST] /eleicao.`);
                                }
                            }

                            lancar_eleicao();
                        }
                    } else {              // Caso haja erros...
                        functions.enviar_log("Error", `Coordenador OFFLINE - Info indisponível`, `O coordenador X foi confirmado offline, porém houve um erro ao tentar ler o arquivo com o info. Verifique o /info e/ou me contate. A eleição não poderá ser iniciada até que se resolva esse erro.`);
                    }
                });
                console.log(`[${functions.horario_atual()}] (Coordenador OFFLINE) iniciando uma nova eleição!`);
            }
        }
    }
}

module.exports = { verificacao };