/*jshint esversion: 6 */
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const functions = require("./modules/functions");

// File System - Lidar com arquivos
var fs = require('fs');
const axios = require('axios');
const { type } = require('os');
// const { application } = require('express');

const app = express()
// app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let ativos = [
    {
        "id": "201720295",
        "nome": "Allana Dos Santos Campos",
        "url": "https://sd-ascampos-20212.herokuapp.com/"
    },
    {
        "id": "201710376",
        "nome": "Guilherme Senna Cruz",
        "url": "https://nodejs-sd-guilhermesenna.herokuapp.com/"
    },
    {
        "id": "201710377",
        "nome": "Hiago Rios Cordeiro",
        "url": "https://sd-api-uesc.herokuapp.com/"
    },
    {
        "id": "201810665",
        "nome": "Jenilson Ramos Santos",
        "url": "https://jenilsonramos-sd-20211.herokuapp.com/"
    },
    {
        "id": "201710396",
        "nome": "Robert Morais Santos Broketa",
        "url": "https://pratica-sd.herokuapp.com/"
    }
]

let expiracao = -1;
let codigo = -1;
let valor = -1;
let eleicoes_em_andamento = [];

app.use(require('./routes/basicas'));
app.use(require('./routes/info'));
app.use(require('./routes/peers'));

// [GET] /recurso
app.get('/recurso', (req, res) => {
    let codigo_acesso = req.body.codigo_de_acesso;

    if (codigo == codigo_acesso) {
        if (expiracao != -1) {
            let data = new Date();

            if (data / 1000 < expiracao / 1000) {  // Menor que 10 segundos
                res.send({ "valor": valor })
            } else {
                return res.status(401).json({ status: 401, message: 'Código expirado.' });
            }
        } else {
            return res.status(401).json({ status: 401, message: 'Expiração inválida, gere um código primeiro.' });
        }

    } else {
        return res.status(401).json({ status: 401, message: 'Código inválido.' });
    }
});

// [POST] /recurso
app.post('/recurso', (req, res) => {

    // Primeiro uso
    if (expiracao == -1) {
        res.send(functions.retornar_recurso());
    } else {
        let data = new Date();

        if (data / 1000 < expiracao / 1000) {  // Menor que 10 segundos
            return res.status(409).json({ status: 409, message: `Recurso em uso` });
        } else {
            res.send(functions.retornar_recurso());
        }
    }
});

// [PUT] /recurso
app.put('/recurso', (req, res) => {
    let valor_modificar = req.body.valor;
    let codigo_acesso = req.body.codigo_de_acesso

    if (codigo == codigo_acesso) {
        if (expiracao != -1) {
            let data = new Date();

            if (data / 1000 < expiracao / 1000) {  // Menor que 10 segundos

                valor = valor_modificar;

                let json = {
                    "codigo_de_acesso": codigo,
                    "valor": valor
                }

                res.send(json);
            } else {
                return res.status(401).json({ status: 401, message: 'Código expirado.' });
            }
        } else {
            return res.status(401).json({ status: 401, message: 'Expiração inválida, gere um código primeiro.' });
        }

    } else {
        return res.status(401).json({ status: 401, message: 'Código inválido.' });
    }
});

// [DELETE] /recurso
app.delete('/recurso', (req, res) => {
    let codigo_acesso = req.body.codigo_de_acesso

    if (codigo == codigo_acesso) {
        if (expiracao != -1) {
            let data = new Date();

            if (data / 1000 < expiracao / 1000) {  // Menor que 10 segundos
                expiracao = -1;
                codigo = -1;
                valor = -1;

                res.sendStatus(200);
            } else {
                return res.status(410).json({ status: 410, message: 'Código expirado.' });
            }
        } else {
            return res.status(410).json({ status: 410, message: 'Expiração inválida, gere um código primeiro.' });
        }

    } else {
        return res.status(410).json({ status: 410, message: 'Código inválido.' });
    }
});


app.get('/coordenador', (req, res) => {
    let json = {
        "coordenador": "false",
        "coordenador_atual": 0
    };

    res.send(json);
});

app.get('/eleicao', (req, res) => {

    fs.readFile('info.json', function (err, data) {

        if (!err) {           // Se não houver erros...

            var temp = JSON.parse(data.toString());

            let json = {
                "tipo_de_eleicao_ativa": temp.tipo_de_eleicao_ativa,
                "eleicoes_em_andamento": eleicoes_em_andamento
            };

            res.send(json);
        } else {              // Caso haja erros...
            res.send(err);    // Retorna o erro.
        }
    });

});

app.post('/eleicao', (req, res) => {
    let atributos = [
        'id',
        'dados'
    ];

    let check = true;

    let id_eleicao = req.body.id;

    // Tenta ler o arquivo req.body
    if (Object.values(req.body).length === 0) {          // Checa se o JSON está vazio
        return res.status(400).json({ status: 400, message: 'O corpo da requisição está vazio' });
    } else {
        Object.keys(req.body).some(function (key) {      // Similar ao Foreach, mas esse permite retorno.
            if (!key && !req.body[key]) {                // O conteúdo da mensagem torna auto-explicativo as comparações.
                check = false;
                return res.status(400).json({ status: 400, message: 'Há uma chave e valor vazios.' });
            } else if (!key) {
                check = false;
                return res.status(400).json({ status: 400, message: 'Há uma chave vazia' });
            } else if (!req.body[key]) {
                check = false;
                return res.status(400).json({ status: 400, message: `Chave '${key}' com valor vazio.` });
            } else if (!atributos.includes(key)) {       // Checa se o nome da chave é válido
                check = false;
                return res.status(400).json({ status: 400, message: `A chave '${key}' não é válida. Verifique as letras maiúsculas/minúsculas e acentuação.` });
            }
        });

        // Checa se todas as chaves necessárias estão inclusas
        if (check) {
            let conteudo = JSON.stringify(req.body);

            // Checa se há as 2 chaves: id e dados.
            if (!atributos.every(element => conteudo.includes(element))) {
                check = false;
                return res.status(400).json({ status: 400, message: `É necessário ter todas as 2 chaves: 'id' e 'dados'.` });
            }
        }

        if (check) {
            if (!(typeof req.body.id === 'string' || req.body.id instanceof String)) {
                check = false;
                return res.status(400).json({ status: 400, message: `id não é string` });
            }
        }
    }

    if (check) {
        fs.readFile('info.json', function (err, data) {

            if (!err) {           // Se não houver erros...

                // Pega as informações do info
                var temp = JSON.parse(data.toString());

                // Detecta o tipo de eleição
                let tipo_eleicao = temp.tipo_de_eleicao_ativa;

                //Caso for do tipo valentao
                if (tipo_eleicao == "valentao") {

                    const valentao = async () => {
                        // Flag para detectar se algum dos servidores está ativo
                        let alguem_ativo = false;

                        // Log para avisar que o algoritmo está em execução
                        await functions.enviar_log("Success", `Eleição em processamento (valentao)`, `A eleição ${id_eleicao} está em processamento, em breve será decidido um novo coordenador.`);

                        // Adicionando a eleição na lista de eleições em andamento
                        eleicoes_em_andamento.push(req.body.id);

                        // Filtra os peers deixando apenas os que tem ID superior ao atual
                        const ativos_filtrados = ativos.filter(ativo => parseInt(ativo.id) > 201710376);


                        console.log(ativos_filtrados)
                        // Não existe servidores com ID menor que o atual
                        if (!ativos_filtrados.length) {
                            // Sou o coordenador
                            // Enviar para todos informando
                            eleicoes_em_andamento = functions.remover_eleicao(id_eleicao, "valentao", 0, eleicoes_em_andamento);
                        } else {
                            functions.pegar_infos(ativos_filtrados)
                                .then(function (ativos_info) {

                                    // Lista com os infos dos ativos + ID
                                    if (ativos_info.length) {
                                        ativos_info.map((ativo) => {

                                            // Status do servidor detectado como ativo
                                            if (ativo.status == "online") {
                                                alguem_ativo = true;
                                                console.log(`enviando para ${ativo.server_endpoint}`);
                                            }
                                        });

                                        // Nenhum dos servidores listados está ativo
                                        if (!alguem_ativo) {
                                            // Sou o coordenador
                                            // Enviar para todos informando
                                            eleicoes_em_andamento = functions.remover_eleicao(id_eleicao, "valentao", 0, eleicoes_em_andamento);
                                            console.log(eleicoes_em_andamento);
                                        }
                                        // Provavel erro, nenhum servidor voltado
                                    } else {
                                        functions.enviar_log("Error", `Sem info dos servidores`, `Esse erro ocorre quando nenhum servidor é retornado ao se pedir a lista de infos, por favor me informe.`);
                                        eleicoes_em_andamento = functions.remover_eleicao(id_eleicao, "valentao", 0, eleicoes_em_andamento);
                                    }

                                });
                        }
                        // Caso eu seja o novo coordenador

                        return res.status(200).json({
                            status: 200, message: `Valentão escolhido`
                        });
                    }

                    valentao();


                } else if (tipo_eleicao == "anel") {
                    // Algoritmo do valentão
                } else {

                    functions.enviar_log("Critical", "Tipo de eleição inválido", "Tipo de eleição inserido incorretamente na /info. Os tipos aceitos e reconhecidos são: 'valentao' e 'anel'. Tudo minúsculo e sem acentos.");


                    return res.status(404).json({
                        status: 404, message: `Algoritmo de eleição não identificado: '${tipo_eleicao}' `
                    });
                }

                // res.send(json);
            } else {              // Caso haja erros...
                res.send(err);    // Retorna o erro.
            }
        });
    }

});

app.post('/eleicao/:id', (req, res) => {

    let id = req.params.id;

    let atributos = [
        'coordenador',
        'id_eleicao'
    ];

    let { check, mensagem } = functions.checagens_iniciais(atributos, req.body);

    if (!check) {
        return res.status(400).json({ status: 400, message: mensagem });
    }

    // Checa se todas as chaves necessárias estão inclusas
    if (check) {
        let conteudo = JSON.stringify(req.body);

        // Checa se há as 2 chaves: id e dados.
        if (!atributos.every(element => conteudo.includes(element))) {
            check = false;
            return res.status(400).json({ status: 400, message: `É necessário ter todas as 2 chaves: 'coordenador' e 'id_eleicao'.` });
        }
    }

    if (check) {
        if (!(typeof req.body.id_eleicao === 'string' || req.body.id_eleicao instanceof String)) {
            check = false;
            return res.status(400).json({ status: 400, message: `id_eleicao não é string` });
        }
    }

    // Tornado falso para checar se acha um ID presente entre os procurados
    check = false;

    // Checa se o nome e o ID solicitado para alteração já não é usado por outro usuário
    for (var i = 0; i < ativos.length; i++) {
        // console.log(`ID-Parâmetro ${id} / ID-Requisição ${req.body.id} / ID-Usuário ${ativos[i].id}`);

        // [ADICIONAR] Adicionar checagem se o id_eleicao existe e é ativo
        if ((ativos[i].id == id)) {
            check = true;
            break;
        }
    }

    if (!check) {
        return res.status(409).json({ status: 409, message: `ID não presente entre os ativos.` });
    } else {
        fs.readFile('info.json', function (err, data) {

            if (!err) {           // Se não houver erros...

                var temp = JSON.parse(data.toString());

                let tipo_eleicao = temp.tipo_de_eleicao_ativa;


                // Lembrar também de consultar os endpoints dos outros
                if (tipo_eleicao == "valentao") {
                    // Algoritmo do valentão
                } else if (tipo_eleicao == "anel") {
                    // Algoritmo do valentão
                } else {
                    return res.status(404).json({
                        status: 404, message: `Algoritmo de eleição não identificado: '${tipo_eleicao}' `
                    });
                }

                res.send(json);
            } else {              // Caso haja erros...
                res.send(err);    // Retorna o erro.
            }
        });
    }

});

app.get('/teste', (req, res) => {

    // Lista das infos de todos os participantes ativos
    lista_de_infos = [];

    // Função que requisita a info dos participantes
    const get_info = async (ativo) => {
        // Requisição para a URL do parcipante + a rota desejada (info)
        const resp = await axios.get(ativo.url + "info");

        // Adiciona o ID do parcipante na lista de infos
        resp.data.id = ativo.id;

        // Retorna a info + ID
        return resp.data;
    };

    // Função para capturar todas as infos
    const infos = async () => {

        // Espera acabar todas as promises
        Promise.all(

            // Map de todos os peers ativos atualmente
            ativos.map(async (ativo) => {
                // Retorno da função aonde é feito a requisição das infos
                const info_ = await get_info(ativo);

                // Adiciona a info obtida na lista de infos
                lista_de_infos.push(info_);
            })
        )
            // Caso não encontre erros, retorna a lista de infos +ID
            .then(function () { res.send(lista_de_infos); })

            // Caso encontre erros, motra a URL aonde ocorreu o erro.
            .catch(function (err) {
                if (err.hostname) {
                    res.status(400).json({ status: 400, message: `Erro ao tentar obter o info de: ${err.hostname}` });
                } else {
                    res.status(400).json({ status: 400, message: `Erro desconhecido ao tentar obter o` });
                }

            });
    };

    // Chama a função das infos
    infos();

});

app.listen(process.env.PORT || 8000, () => {
    console.log('App Started...');
});

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
                            functions.enviar_log("Error", `Coordenador OFFLINE - Tipo de eleição inválido`, `O coordenador X foi confirmado offline, porém o tipo de eleicão está como '${tipo_eleicao}' que não é um valor válido. Os valores possíveis são 'anel' ou 'valentao'. Tudo minúsculo e sem acento. A eleição só poderá ser iniciada quando houver um tipo de eleição válido no /info.`);
                        } else {
                            functions.enviar_log("Success", `Iniciando nova eleição (Coordenador OFFLINE)`, `O coordenador X foi confirmado offline, a eleição correrá pelo algoritmo do ${tipo_eleicao}.`);

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

// verificacao();