/*jshint esversion: 6 */
const { v4: uuidv4 } = require('uuid');
const express = require('express');

// File System - Lidar com arquivos
var fs = require('fs');
const fsa = require('fs').promises;
const axios = require('axios');
const { application } = require('express');
// const fsa = require('fs').promises;

const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let info_default = {
    "server_name": "server",
    "server_endpoint": "https://nodejs-sd-guilhermesenna.herokuapp.com/",
    "descricao": "Projeto de SD. Os seguintes serviços estão implementados: info, peers, recurso, etc",
    "versao": "0.1",
    "status": "online",
    "tipo_de_eleicao_ativa": "ring"
};

let peers_default = [
    {
        "id": "201720295",
        "nome": "Allana Dos Santos Campos",
        "url": "https://sd-ascampos-20212.herokuapp.com/"
    },
    {
        "id": "201512136",
        "nome": "Annya Rita De Souza Ourives",
        "url": "https://sd-annyaourives-20212.herokuapp.com/hello"
    },
    {
        "id": "201512137",
        "nome": "Daniel Andrade Penêdo Santos",
        "url": ""
    },
    {
        "id": "201710375",
        "nome": "Emmanuel Norberto Ribeiro Dos Santos",
        "url": "https://sd-emmanuel.herokuapp.com/"
    },
    {
        "id": "201420373",
        "nome": "Gabriel Figueiredo Góes",
        "url": ""
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
        "id": "201610327",
        "nome": "João Pedro De Gois Pinto",
        "url": "https://sd-joaopedrop-20212.herokuapp.com/"
    },
    {
        "id": "201610337",
        "nome": "Luís Carlos Santos Câmara",
        "url": "https://sd-20212-luiscarlos.herokuapp.com/"
    },
    {
        "id": "201620181",
        "nome": "Matheus Santos Rodrigues",
        "url": ""
    },
    {
        "id": "201620400",
        "nome": "Nassim Maron Rihan",
        "url": "https://sd-nassimrihan-2021-2.herokuapp.com/"
    },
    {
        "id": "201710396",
        "nome": "Robert Morais Santos Broketa",
        "url": "https://pratica-sd.herokuapp.com/"
    },
    {
        "id": "201720308",
        "nome": "Victor Dos Santos Santana",
        "url": "https://sd-victor-20212.herokuapp.com/"
    }
];

let ativos = [
    {
        "id": "201720295",
        "nome": "Allana Dos Santos Campos",
        "url": "https://sd-ascampos-20212.herokuapp.come/"
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
        "id": "201710396",
        "nome": "Robert Morais Santos Broketa",
        "url": "https://pratica-sd.herokuapp.com/"
    }
]

let expiracao = -1;
let codigo = -1;
let valor = -1;
let eleicoes_em_andamento = [];

let json_info = JSON.stringify(info_default);
let json_peers = JSON.stringify(peers_default);

// async function resetar() {
//     // Reseta o conteúdo de info
//     fs.writeFile('info.json', json_info, function (err) {
//         if (err) {
//             throw err;
//         } else {
//             // Reseta o conteúdo do peers
//             fs.writeFile('peers.json', json_peers, function (err) {
//                 if (err)
//                     throw err;
//                 res.send('info e peers resetados com sucesso');
//             });
//         }
//     });
// }


app.get('/reset', (req, res) => {
    // Reseta o conteúdo de info
    fs.writeFile('info.json', json_info, function (err) {
        if (err) {
            throw err;
        } else {
            // Reseta o conteúdo do peers
            fs.writeFile('peers.json', json_peers, function (err) {
                if (err)
                    throw err;
                res.send('info e peers resetados com sucesso');
            });
        }
    });

});

app.get('/', (req, res) => {
    res.send('Rotas: /clientes, /pag1, /pag2, /pag3, /hello, /resolver, /info, /peers, /peers/ID')
});

app.post('/', (req, res) => {
    res.send('Hello Post!')
});

app.get('/hello', (req, res) => {
    if (req.query.name) {
        res.send(`Hello ${req.query.name}!`)
    }
    else {
        res.send('Hello World!')
    }
});

app.get('/clientes', (req, res) => {
    res.send(['Mathias', 'José', 'Thiago'])
});

app.get('/pag1', (req, res) => {
    res.send('Página 1')
});

app.get('/pag2', (req, res) => {
    res.send('Página 2')
});

app.get('/pag3', (req, res) => {
    res.send('Página 3')
});

// [GET] /info
app.get('/info', (req, res) => {
    // Tenta ler o arquivo info.json
    fs.readFile('info.json', function (err, data) {

        if (!err) {           // Se não houver erros...
            res.send(data);   // Printa o conteúdo.
        } else {              // Caso haja erros...
            res.send(err);    // Retorna o erro.
        }
    });
});

//[PUT] /info
app.put('/info', (req, res) => {

    // Lista com as chaves possíveis de serem adicionadas
    let atributos = [
        'server_name',
        'server_endpoint',
        'descricao',
        'versao',
        'status',
        'tipo_de_eleicao_ativa'
    ]

    let check = true;

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
        })
    }

    if (check) {
        // Faz o parser correto para JSON, senão o arquivo é escrito como: '[object object]'
        let json = JSON.stringify(req.body);

        // Tenta ler o arquivo info.json
        fs.readFile('info.json', function (err, data) {
            if (!err) {           // Se não houver erros...
                let peers_file = JSON.parse(data);
                check = true;

                // Essas checagens ocorrem porque algumas chaves podem ser passadas vazias, nesse caso serve para alterar parcialmente
                if (req.body.server_name) {
                    peers_file.server_name = req.body.server_name;
                }

                if (req.body.server_endpoint) {
                    peers_file.server_endpoint = req.body.server_endpoint;
                }

                if (req.body.descricao) {
                    peers_file.descricao = req.body.descricao;
                }

                if (req.body.versao) {
                    peers_file.versao = req.body.versao;
                }

                if (req.body.status) {
                    peers_file.status = req.body.status;
                }

                if (req.body.tipo_de_eleicao_ativa) {
                    peers_file.tipo_de_eleicao_ativa = req.body.tipo_de_eleicao_ativa;
                }

                if (check) {
                    var json = JSON.stringify(peers_file);
                    // Atualiza o conteúdo do info.json
                    fs.writeFile('info.json', json, function (err) {
                        if (err) throw err;
                        res.send('O conteúdo foi atualizado com sucesso!');
                    });
                }


            } else {
                return res.send(err);    // Retorna o erro.
            }
        });

    }
});

// [GET] /peers
app.get('/peers', (req, res) => {

    // Tenta ler o arquivo peers.json
    fs.readFile('peers.json', function (err, data) {
        if (!err) {           // Se não houver erros...
            res.send(data);   // Printa o conteúdo.
        } else {              // Caso haja erros...
            res.send(err);    // Retorna o erro.
        }
    });
});

// [POST] /peers
app.post('/peers', (req, res) => {

    // Lista com as chaves possíveis de serem adicionadas
    let peers = [
        'id',
        'nome',
        'url'
    ];

    console.log(req.body)


    // console.log(req.body);

    let check = true;

    // Tenta ler o arquivo peers.json
    fs.readFile('peers.json', function (err, data) {
        if (!err) {    // Se não houver erros...
            let peers_file = JSON.parse(data);

            // Tenta ler o arquivo message.json
            if (Object.values(req.body).length === 0) {          // Checa se o JSON está vazio
                check = false;
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
                    } else if (!peers.includes(key)) {          // Checa se o nome da chave é válido
                        check = false;
                        return res.status(400).json({ status: 400, message: `A chave '${key}' não é válida. Verifique as letras maiúsculas/minúsculas e acentuação.` });
                    }
                });

                // Checa se todas as chaves necessárias estão inclusas
                if (check) {
                    let conteudo = JSON.stringify(req.body);

                    // Checa se há as 3 chaves: id, nome e url.
                    if (!peers.every(element => conteudo.includes(element))) {
                        check = false;
                        return res.status(400).json({ status: 400, message: `É necessário ter todas as 3 chaves: 'id', 'nome' e 'url'.` });
                    }
                }

                if (check) {
                    if (!(typeof req.body.nome === 'string' || req.body.nome instanceof String) || !(typeof req.body.url === 'string' || req.body.url instanceof String)) {
                        check = false;
                        return res.status(400).json({ status: 400, message: `ID e/ou nome não é string` });
                    }
                }
            }

            if (check) {
                for (var i = 0; i < peers_file.length; i++) {
                    if (peers_file[i].id == req.body.id && peers_file[i].nome == req.body.nome) {
                        check = false;
                        return res.status(409).json({ status: 409, message: `Já existe esse ID e nome cadastrados.` });
                    }
                    else if (peers_file[i].id == req.body.id) {
                        check = false;
                        return res.status(409).json({ status: 409, message: `Já existe esse ID cadastrado.` });
                    } else if (peers_file[i].nome == req.body.nome) {
                        check = false;
                        return res.status(409).json({ status: 409, message: `Já existe esse nome cadastrado.` });
                    }
                }
            }

            if (check) {
                peers_file.push(req.body);
                let json = JSON.stringify(peers_file);

                // Adiciona o novo objeto no conjunto
                fs.writeFile('peers.json', json, function (err) {
                    if (err) throw err;
                    // return res.send('O peer foi adicionado corretamente!');
                    res.send(req.body);
                });
            }


        } else {   // Caso haja erros...
            return res.send(err);    // Retorna o erro.
        }
    });


    // Faz o parser correto para JSON, senão o arquivo é escrito como: '[object object]'
    // let json = JSON.stringify(req.body);

    // // Atualiza o conteúdo do info.json
    // fs.writeFile('peers.json', json, function (err) {
    //     if (err) throw err;
    //     res.send('O conteúdo foi atualizado com sucesso!');
    // });
});


// [GET] /peers
app.get('/peers/:id', (req, res) => {

    let id = req.params.id;

    // console.log(id)

    // Tenta ler o arquivo peers.json
    fs.readFile('peers.json', function (err, data) {
        if (!err) {           // Se não houver erros...
            let peers = JSON.parse(data);

            for (var i = 0; i < peers.length; i++) {
                if (peers[i].id == id) {
                    return res.send(peers[i]); // Caso ache um usuário com o ID solicitado
                }
            }

            // Caso não ache
            return res.status(404).json({ status: 404, message: `O ID '${id}' não está associado a nenhum usuário.` });
        } else {              // Caso haja erros...
            res.send(err);    // Retorna o erro.
        }
    });
});

// [PUT] /peers
app.put('/peers/:id', (req, res) => {

    let peers = [
        'id',
        'nome',
        'url'
    ];

    // resetar()

    let check = true;

    let id = req.params.id;

    // console.log(req.body);

    // if (!Number.isInteger(id)) {
    //     check = false;
    //     return res.status(404).json({ status: 404, message: `O ID passado não é inteiro.` });
    // }

    // Tenta ler o arquivo peers.json
    fs.readFile('peers.json', function (err, data) {
        if (!err) {           // Se não houver erros...
            let peers_file = JSON.parse(data);

            // Checagem da requisição antes de tentar editar
            if (Object.values(req.body).length === 0) {          // Checa se o JSON está vazio
                check = false;
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
                    } else if (!peers.includes(key)) {          // Checa se o nome da chave é válido
                        check = false;
                        return res.status(400).json({ status: 400, message: `A chave '${key}' não é válida. Verifique as letras maiúsculas/minúsculas e acentuação.` });
                    }
                });
                if (!check) {
                    return false;
                }
            }

            // Checar se o ID solicitado na requisição é usado por outro usuário (evitar duplicidade)
            check = true;

            // Checa se o nome e o ID solicitado para alteração já não é usado por outro usuário
            for (var i = 0; i < peers_file.length; i++) {
                // console.log(`ID-Parâmetro ${id} / ID-Requisição ${req.body.id} / ID-Usuário ${peers_file[i].id}`);
                if ((peers_file[i].id == req.body.id || peers_file[i].nome == req.body.nome) && id != req.body.id) {

                    check = false;
                    return res.status(409).json({ status: 409, message: `Esse ID ou nome já está sendo usado por outro usuário.` });
                }
            }

            // Caso o nome e ID não esteja sendo usado por outro usuário
            if (check) {
                // Alterado para ser usado embaixo 
                check = false;
                for (var i = 0; i < peers_file.length; i++) {
                    if (peers_file[i].id == id) {

                        // Essas checagens ocorrem porque algumas chaves podem ser passadas vazias, ou alterar apenas parcialmente
                        if (req.body.id) {
                            peers_file[i].id = req.body.id;
                        }

                        if (req.body.nome) {
                            peers_file[i].nome = req.body.nome;
                        }

                        if (req.body.url) {
                            peers_file[i].url = req.body.url;
                        }

                        check = true;
                        break;
                    }
                }
            }

            if (check) {
                // Adiciona o novo objeto no conjunto

                var json = JSON.stringify(peers_file);
                console.log(req.body)

                fs.writeFile('peers.json', json, function (err) {
                    if (err) throw err;
                    // return res.status(200).json({ status: 200, message: req.body });
                    res.send(req.body);
                });
            } else {
                // Caso não ache um usuário associado ao ID
                return res.status(404).json({ status: 404, message: `O ID '${id}' não está associado a nenhum usuário.` });

            }

        } else {              // Caso haja erros...
            res.send(err);    // Retorna o erro.
        }
    });
});

// [DELETE] /peers
app.delete('/peers/:id', (req, res) => {

    let id = req.params.id;
    let check = false;

    // Tenta ler o arquivo peers.json
    fs.readFile('peers.json', function (err, data) {
        if (!err) {           // Se não houver erros...
            let peers = JSON.parse(data);

            // Remoção do peer
            for (var i = 0; i < peers.length; i++) {
                if (peers[i].id == id) {
                    peers.splice(i, 1);
                    check = true;
                    break;
                }
            }

            if (check) {
                var json = JSON.stringify(peers);
                fs.writeFile('peers.json', json, function (err) {
                    if (err) throw err;
                    return res.status(200).json({ status: 200, message: `O peer selecionado foi removido com sucesso!` });
                });
            } else {
                // Caso não ache
                return res.status(404).json({ status: 404, message: `O ID '${id}' não está associado a nenhum usuário.` });
            }


        } else {              // Caso haja erros...
            res.send(err);    // Retorna o erro.
        }
    });
});

// [GET] /recurso
app.get('/recurso', (req, res) => {
    let codigo_acesso = req.body.codigo_de_acesso

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

// [POST] /recurso
app.post('/recurso', (req, res) => {

    // Primeiro uso
    if (expiracao == -1) {
        res.send(retornar_recurso());
    } else {
        let data = new Date();

        if (data / 1000 < expiracao / 1000) {  // Menor que 10 segundos
            return res.status(409).json({ status: 409, message: `Recurso em uso` });
        } else {
            res.send(retornar_recurso());
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
        "coordenador_atual": "id_do_coordenador"
    };

    res.send(json);
});

// Checar a cada 2 segundos se o coordenador está ativo

// Checar se o coordenador está online pelo info

// Caso não esteja esperar um tempo entre 5 e 10 segundos, tentar de novo
// Caso ainda sim não esteja, iniciar a eleição

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

app.post('/eleicao/:id', (req, res) => {

    let id = req.params.id;

    let atributos = [
        'coordenador',
        'id_eleicao'
    ];

    let check = true;

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
                return res.status(400).json({ status: 400, message: `É necessário ter todas as 2 chaves: 'coordenador' e 'id_eleicao'.` });
            }
        }

        if (check) {
            if (!(typeof req.body.id_eleicao === 'string' || req.body.id_eleicao instanceof String)) {
                check = false;
                return res.status(400).json({ status: 400, message: `id_eleicao não é string` });
            }
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

// Testando um axios para o localhost
app.get('/auto', (req, res) => {
    const teste = async () => {
        const resp = await axios.get('http://localhost:8000/info');
        console.log(resp.data)
    }

    teste();

});

// Verificações para as chamadas consecutivas

function horario_atual() {
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    return (horario = hour + ":" + min + ":" + sec);
}

app.get('/verificar', (req, res) => {
    // const teste = async () => {
    //     function sleep(ms) {
    //         return new Promise((resolve) => {
    //             setTimeout(resolve, ms);
    //         });
    //     }

    //     while (true) {

    //         console.log(`[${horario_atual()}] Verificando coordenador, Aguarde 2 segundos...`);
    //         await sleep(2000);

    //         // if coordenador == offline
    //         if (true) {
    //             let timer_gerado = (Math.floor(Math.random() * (10 - 5 + 1)) + 5);
    //             console.log(`[${horario_atual()}] O coordenador parece não estar ativo, aguardando ${timer_gerado} segundos para testar novamente!`);

    //             // Checar de novo se o coordenado está ativo
    //             await sleep(timer_gerado * 1000);

    //             // if coordenador == offline
    //             if (true) {
    //                 console.log(`[${horario_atual()}] O coordenador está offline, iniciando uma nova eleição!`)
    //             }
    //         }
    //     }
    //     res.send("teste")
    // }

    // teste();
});

// Verificacao contínua se o coordenador está online
const verificacao = async () => {
    function sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    while (true) {

        console.log(`[${horario_atual()}] (1ª verificação coordenador) aguardando 2 segundos...`);
        await sleep(2000);

        // if coordenador == offline
        if (true) {
            let timer_gerado = (Math.floor(Math.random() * (10 - 5 + 1)) + 5);
            console.log(`[${horario_atual()}] (2ª verificação coordenador) aguardando ${timer_gerado} segundos para testar novamente!`);

            // Checar de novo se o coordenado está ativo
            await sleep(timer_gerado * 1000);

            // if coordenador == offline
            if (true) {
                console.log(`[${horario_atual()}] (Coordenador OFFLINE) iniciando uma nova eleição!`)
            }
        }
    }
}

verificacao();

app.post('/resolver', (req, res) => {

    // Lógica antiga, preciso refatorar.

    // Objeto 'links' com o nome dos alunos e seus respectivos deploys
    let links = {
        'hiago': 'https://sd-api-uesc.herokuapp.com/',
        'robert': 'https://pratica-sd.herokuapp.com/',
        'luis': 'https://sd-20212-luiscarlos.herokuapp.com/',
        'joao': 'https://sd-joaopedrop-20212.herokuapp.com/',
        'guilherme': 'https://nodejs-sd-guilhermesenna.herokuapp.com/',
        'allana': 'https://sd-ascampos-20212.herokuapp.com/',
        'jenilson': 'https://jenilsonramos-sd-20211.herokuapp.com/',
        'emmanuel': 'https://sd-emmanuel.herokuapp.com/',
        'annya': 'https://sd-annyaourives-20212.herokuapp.com/',
        'nassim': 'https://sd-nassimrihan-2021-2.herokuapp.com/',
        'victor': 'https://sd-victor-20212.herokuapp.com/',
        'daniel': 'https://sd-danielpenedo-20212.herokuapp.com/'
    }

    if (Object.values(req.body).length === 0) {          // Checa se o JSON está vazio
        res.send(links)
    } else if (!('arguments' in req.body) || !('operacao' in req.body)) { // Checa se há as chaves 'arguments' e 'operacao'
        res.send('As chaves estão erradas')
    } else if (Object.values(req.body.operacao).length === 0) { // Checa se o conteúdo de arguments está vazio
        res.send('O conteúdo da chave "operacao" está vazio')
    }
    else if (Object.values(req.body.arguments).length === 0) { // Checa se o conteúdo de arguments está vazio
        res.send('O conteúdo da chave "arguments" está vazio')
    }
    else if (!('nome' in req.body.arguments)) {                 // Checa se há a chave 'nome' em arguments
        res.send('Não há a chave "nome" em "arguments".')
    }
    else {                                                      // Caso seja válido as verificações na chave e JSON não-vazio
        let nome = req.body.arguments.nome;                    // Armazena o parametro na variavel nome
        if (!nome) {
            res.send('Campo vazio, insira algum nome!')         // Confere se o valor da chave está vazio
        }
        else if (links[`${nome}`] !== undefined) {               // Checa se o nome/parametro é uma chave (aluno) do objeto
            res.send(links[nome]);                              // Caso seja mostra o valor da chave (link)
        }
        else {
            res.send('Não existe esse nome na lista.');         // Caso não esteja no objeto, avisa ao usuário
        }
    }
});

app.listen(process.env.PORT || 8000, () => {
    console.log('App Started...');
});
