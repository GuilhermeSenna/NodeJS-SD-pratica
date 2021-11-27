/*jshint esversion: 6 */
const express = require('express');
const functions = require("./modules/functions");
const verificacao = require("./modules/verificacao");

// File System - Lidar com arquivos
var fs = require('fs');
const axios = require('axios');
// const { application } = require('express');

const app = express();
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
        // "url": "http://localhost:8000/"
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

let codigo = -1;
let expiracao = -1;
let valor = -1;
let coordenador = 201710396;
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
                res.send({ "valor": valor });
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
        let json = functions.retornar_recurso();
        expiracao = json.validade;
        codigo = json.codigo_de_acesso;
        valor = 1;

        res.send(json);
    } else {
        let data = new Date();

        if (data / 1000 < expiracao / 1000) {  // Menor que 10 segundos
            return res.status(409).json({ status: 409, message: `Recurso em uso` });
        } else {
            let json = functions.retornar_recurso();
            expiracao = json.validade;
            codigo = json.codigo_de_acesso;
            valor = 1;

            res.send(json);
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

    let json;

    if (coordenador == 201710376) {
        json = {
            "coordenador": "true",
            "coordenador_atual": 201710376
        };
    } else {
        json = {
            "coordenador": "false",
            "coordenador_atual": coordenador
        };
    }

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


async function enviar_eleicao(ativo, id_eleicao) {

    var alguem_ativo = false;
    var alguem_recebeu = false;

    // Status do servidor detectado como ativo
    if (ativo.status == "online") {

        alguem_ativo = true;

        const enviar_eleicao_ = async () => {

            let mensagem =
            {
                "id": id_eleicao,
                "dados": []
            }

            let segundos = 9;

            await axios({
                method: 'post',
                url: ativo.server_endpoint + "eleicao",
                timeout: 1000 * segundos,
                data: mensagem
            })
                .then(async function (response) {
                    await functions.enviar_log("Success", `Eleição enviada com sucesso`, `A eleição '${id_eleicao}' foi enviada com sucesso para '${ativo.server_endpoint}'`);
                    alguem_recebeu = true;
                })
                .catch(async function (error) {
                    if (error.code == 'ECONNABORTED') {
                        await functions.enviar_log("Error", `Erro ao enviar eleição (Timeout)`, `Erro ao enviar a eleição '${id_eleicao}' para '${ativo.server_endpoint}'. Motivo: 'Servidor não respondeu após uma espera de ${segundos} segundos.'`);
                    } else {
                        await functions.enviar_log("Error", `Erro ao enviar eleição (HTTP status)`, `Erro ao enviar a eleição '${id_eleicao}' para '${ativo.server_endpoint}'. Erro: '${error.message}'`);
                    }
                });

        }

        await enviar_eleicao_();

        return ({ alguem_ativo: alguem_ativo, alguem_recebeu: alguem_recebeu });

    } else {
        await functions.enviar_log("Warning", `Servidor Offline`, `Servidor '${ativo.server_endpoint}' detectado como Offline. Será desconsiderado da eleição`);
    }

}


async function mapear_ativos(ativos_info, id_eleicao) {
    // Promise.ALL

    let alguem_ativo = false;
    let alguem_recebeu = false;

    await Promise.all(
        ativos_info.map(async (ativo) => {

            console.log(`-> ${ativo.id}`);
            if (ativo.id != '201710376') {
                let valores = await enviar_eleicao(ativo, id_eleicao);

                if (valores) {
                    alguem_ativo = valores.alguem_ativo;
                    alguem_recebeu = valores.alguem_recebeu;
                }
            }
        })
    );

    return ({ alguem_ativo: alguem_ativo, alguem_recebeu: alguem_recebeu });
};

async function informar_coordenador(id, id_eleicao) {
    await Promise.all(
        ativos.map(async (ativo) => {
            let mensagem =
            {
                "coordenador": id,
                "id_eleicao": id_eleicao
            }

            let segundos = 9;

            await axios({
                method: 'post',
                url: ativo.url + `eleicao/coordenador`,
                timeout: 1000 * segundos,
                data: mensagem
            })
                .then(async function (response) {
                    await functions.enviar_log("Success", `Novo coordenador enviado`, `O novo coordenador '${id}' da eleição '${id_eleicao}' foi enviado com sucesso para '${ativo.url}'`);
                    alguem_recebeu = true;
                })
                .catch(async function (error) {

                    if (error.code == 'ECONNABORTED') {
                        await functions.enviar_log("Error", `Erro ao enviar coordenador (Timeout)`, `Erro ao enviar o novo coordenador '${id}' da eleição '${id_eleicao}' para '${ativo.url}'. Motivo: 'Servidor não respondeu após uma espera de ${segundos} segundos.'`);
                    } else {
                        await functions.enviar_log("Error", `Erro ao enviar coordenador (HTTP status)`, `Erro ao enviar o novo coordenador '${id}' da eleição '${id_eleicao}' para'${ativo.url}'. Erro: '${error.message}'`);
                    }

                    // await functions.enviar_log("Error", `Falha ao enviar coordenador`, `Erro ao enviar o novo coordenador '${id}' da eleição '${id_eleicao}' para '${ativo.url}'. Erro: '${error.message}'`);
                });

        })
    );
}

app.post('/eleicao', (req, res) => {
    let atributos = [
        'id',
        'dados'
    ];

    // let check = true;

    let id_eleicao = req.body.id;

    // var ip = req.headers['x-forwarded-for'] ||
    //     req.connection.remoteAddress ||
    //     req.socket.remoteAddress ||
    //     req.connection.socket.remoteAddress;

    console.log(`[${functions.horario_atual()}] Iniciando eleição ${id_eleicao}`);

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
            return res.status(400).json({ status: 400, message: `É necessário ter todas as 2 chaves: 'id' e 'dados'.` });
        }
    }

    if (check) {
        if (!(typeof req.body.id === 'string' || req.body.id instanceof String)) {
            check = false;
            return res.status(400).json({ status: 400, message: `id não é string` });
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
                        // Log para avisar que o algoritmo está em execução
                        await functions.enviar_log("Attention", `Eleição em processamento (valentao)`, `A eleição '${id_eleicao}' está em processamento, em breve será decidido um novo coordenador.`);

                        // Adicionando a eleição na lista de eleições em andamento
                        eleicoes_em_andamento.push(req.body.id);

                        // Filtra os peers deixando apenas os que tem ID superior ao atual
                        let ativos_filtrados = ativos.filter(ativo => parseInt(ativo.id) > 201710376);

                        console.log(`[${functions.horario_atual()}] Ativos filtrados por ID - ${ativos_filtrados}`)

                        // Não existe servidores com ID menor que o atual
                        if (!ativos_filtrados.length) {
                            // Sou o coordenador
                            // Enviar para todos informando
                            // await functions.enviar_log("Success", `Eleição finalizada - Nenhum servidor com ID maior`, `Fim da eleição '${id_eleicao}', o novo coordenador será '201710376' pois é o que tem maior ID dos atuais.`);

                            if (temp.status == 'online') {
                                console.log(`[${functions.horario_atual()}] (Sou o coordenador) - Possuo o maior ID`)
                                eleicoes_em_andamento = functions.remover_eleicao(id_eleicao, "valentao", 201710376, eleicoes_em_andamento, "Possui o maior ID dos atuais.");
                                await informar_coordenador(201710376, id_eleicao);
                                coordenador = 201710376;
                            } else {
                                console.log(`[${functions.horario_atual()}] Estou offline apesar do ID maior`)
                                functions.enviar_log("Warning", `Abstenção da eleição`, `O servidor atual se abstem da eleição '${id_eleicao}', pois apesar de ter o ID maior que os demais, está offline. (A eleição será removida da lista por segurança)`);
                                eleicoes_em_andamento = functions.remover_eleicao(id_eleicao, "valentao", 0, eleicoes_em_andamento, '');
                            }
                        } else {
                            // Pegar info de todos os servidores
                            functions.pegar_infos(ativos_filtrados)
                                .then(function (ativos_info) {

                                    console.log(`[${functions.horario_atual()}] Ativos info - ${ativos_filtrados}`)

                                    // Lista com os infos dos ativos + ID
                                    if (ativos_info.length) {

                                        // await mapear_ativos(ativos_info, id_eleicao)

                                        (async () => {
                                            let { alguem_ativo, alguem_recebeu } = await mapear_ativos(ativos_info, id_eleicao);

                                            console.log(`[${functions.horario_atual()}] Alguem recebeu? - ${alguem_recebeu} Alguem ativo? - ${alguem_ativo}`);

                                            if (!alguem_ativo) {
                                                // Sou o coordenador
                                                // Enviar para todos informando
                                                // await functions.enviar_log("Success", `Eleição finalizada - Nenhum servidor ativo`, `Fim da eleição '${id_eleicao}', o coordenador será o atual (201710376) pois nenhum outro está ativo.`);
                                                if (temp.status == 'online') {
                                                    console.log(`[${functions.horario_atual()}] (Sou o coordenador) - Nenhum outro está ativo`)
                                                    eleicoes_em_andamento = functions.remover_eleicao(id_eleicao, "valentao", 201710376, eleicoes_em_andamento, "Nenhum outro está ativo");
                                                    await informar_coordenador(201710376, id_eleicao);
                                                    coordenador = 201710376;
                                                } else {
                                                    console.log(`[${functions.horario_atual()}] (Eleição cancelada) - Todos offline`);
                                                    functions.enviar_log("Error", `Eleição cancelada - Todos os servidores offlines`, `A eleição ${id_eleicao} está sendo cancelada, pois todos os servidores estão offline, logo não é possível decidir o coordenador.`);
                                                    eleicoes_em_andamento = functions.remover_eleicao(id_eleicao, "valentao", 0, eleicoes_em_andamento, '');
                                                }
                                            } else if (!alguem_recebeu) {
                                                // await functions.enviar_log("Error", `Eleição cancelada - Nenhum servidor recebeu`, `A eleição '${id_eleicao}' está sendo cancelada, pois nenhum servidor recebeu a mensagem. [POST /eleicao]`);
                                                // eleicoes_em_andamento = functions.remover_eleicao(id_eleicao, "valentao", 0, eleicoes_em_andamento, '');

                                                console.log(`[${functions.horario_atual()}] (Sou o coordenador) - Ninguém recebeu`)
                                                eleicoes_em_andamento = functions.remover_eleicao(id_eleicao, "valentao", 201710376, eleicoes_em_andamento, "Nenhum servidor recebeu");
                                                await informar_coordenador(201710376, id_eleicao);
                                                coordenador = 201710376;
                                            }
                                        })();

                                        // Provavel erro, nenhum servidor voltado
                                    } else {
                                        console.log(`[${functions.horario_atual()}] (Eleição cancelada) - Sem info dos servidores`);
                                        functions.enviar_log("Error", `Eleição cancelada - Sem info dos servidores`, `Esse erro ocorre quando nenhum servidor é retornado ao se pedir a lista de infos, por favor me informe se esse erro ocorrer.`);
                                        eleicoes_em_andamento = functions.remover_eleicao(id_eleicao, "valentao", 0, eleicoes_em_andamento, '');
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

                    const anel = async () => {
                        // Log para avisar que o algoritmo está em execução
                        // await functions.enviar_log("Attention", `Eleição em processamento (anel)`, `A eleição '${id_eleicao}' está em processamento, em breve será decidido um novo coordenador.`);

                        // Adicionando a eleição na lista de eleições em andamento
                        eleicoes_em_andamento.push(req.body.id);

                        // Não existe servidores com ID menor que o atual
                        // Pegar info de todos os servidores

                        functions.pegar_infos(ativos)
                            .then(function (ativos_info) {

                                // Checar se meu ID está incluso na lista de ID's

                                // Lista com os infos dos ativos + ID
                                if (ativos_info.length && ativos_info.length != 1) {

                                    // Ordenar pelo nome
                                    ativos_info.sort((a, b) => (a.nome > b.nome) ? 1 : ((b.nome > a.nome) ? -1 : 0));


                                    let index = ativos_info.findIndex(ativos => ativos.id === '201710376');

                                    // Caso mande para uma posição além do possível, será consertado no início do laço while
                                    // Exemplo: Posição 2 em um vetor de tamanho 2.
                                    let posicao = index + 1;
                                    let cont = 0;
                                    let ninguem_apto = false;

                                    while (true) {
                                        if (posicao >= ativos_info.length) {
                                            posicao = 0;
                                        }

                                        console.log(ativos_info[posicao])

                                        if (ativos_info[posicao].status == 'online') {
                                            // Push com meu ID na lista e eleições e enviar
                                            break;
                                        } else {
                                            posicao += 1
                                            cont += 1;

                                            if (cont == ativos_info.length) {
                                                ninguem_apto = true;
                                                break;
                                            }
                                        }
                                    }

                                    if (ninguem_apto) {
                                        functions.enviar_log("Error", `Eleição cancelada - Todos os servidores offlines`, `A eleição ${id_eleicao} está sendo cancelada, pois todos os servidores estão offline, logo não é possível decidir o coordenador.`);
                                        eleicoes_em_andamento = functions.remover_eleicao(id_eleicao, "valentao", 0, eleicoes_em_andamento, '');
                                    }
                                } else {
                                    functions.enviar_log("Error", `Eleição cancelada - Sem info ou poucos servidores`, `Esse erro ocorre quando nenhum servidor ou apenas 1 é retornado ao se pedir a lista de infos.`);
                                    eleicoes_em_andamento = functions.remover_eleicao(id_eleicao, "valentao", 0, eleicoes_em_andamento, '');
                                }

                            });

                        return res.status(200).json({
                            status: 200, message: `Anel escolhido`
                        });
                    }
                    // Caso eu seja o novo coordenador


                    anel();

                }

                // Verificação já feita na parte inicial
                // else {

                //     functions.enviar_log("Critical", "Tipo de eleição inválido", "Tipo de eleição inserido incorretamente na /info. Os tipos aceitos e reconhecidos são: 'valentao' e 'anel'. Tudo minúsculo e sem acentos.");


                //     return res.status(404).json({
                //         status: 404, message: `Algoritmo de eleição não identificado: '${tipo_eleicao}' `
                //     });
                // }

                // res.send(json);
            } else {              // Caso haja erros...
                res.send(err);    // Retorna o erro.
            }
        });
    }

});

app.post('/eleicao/coordenador', (req, res) => {

    // let id = req.params.id;

    console.log(`[${functions.horario_atual()}] (Novo coordenador recebido) - ID eleição: ${req.body.id_eleicao} / novo coordenador: ${coordenador}`);

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
    // check = false;

    // Checa se o nome e o ID solicitado para alteração já não é usado por outro usuário
    // for (var i = 0; i < ativos.length; i++) {
    //     // console.log(`ID-Parâmetro ${id} / ID-Requisição ${req.body.id} / ID-Usuário ${ativos[i].id}`);

    //     // [ADICIONAR] Adicionar checagem se o id_eleicao existe e é ativo
    //     if ((ativos[i].id == id)) {
    //         check = true;
    //         break;
    //     }
    // }

    // if (!check) {
    //     return res.status(409).json({ status: 409, message: `ID não presente entre os ativos.` });
    // } else {

    // }


    if (check) {
        coordenador = req.body.coordenador;
        eleicoes_em_andamento = functions.remover_eleicao(req.body.id_eleicao, "", 0, eleicoes_em_andamento, '');
        functions.enviar_log("Success", `Novo coordenador recebido`, `O novo coordenador '${coordenador}' foi recebido, resultado da eleição '${req.body.id_eleicao}'.`);
        res.send(`Novo coordenador '${coordenador}' adicionado, resultado da eleição '${req.body.id_eleicao}'. Cheque o log para mais informações`);
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

verificacao.verificacao(ativos);