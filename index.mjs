/*jshint esversion: 6 */

import express from 'express';

// File Server - Lidar com arquivos
import fs from 'fs';

const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Rotas: /clientes, /pag1, /pag2, /pag3, /hello, /resolver')
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


// {
//     "server_name": "server",
//     "server_endpoint": "https://nodejs-sd-guilhermesenna.herokuapp.com/",
//     "descrição": "Projeto de SD. Os seguintes serviços estão implementados: info, peers, etc",
//     "versao": "0.1",
//     "Status": "online",
//     "tipo_de_eleicao_ativa": "ring"
// }

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
        'descrição',
        'versao',
        'Status',
        'tipo_de_eleicao_ativa'
    ]

    // Tenta ler o arquivo message.json
    if (Object.values(req.body).length === 0) {          // Checa se o JSON está vazio
        return res.status(400).json({ status: 400, message: 'O corpo da requisição está vazio' });
    } else {
        Object.keys(req.body).some(function (key) {      // Similar ao Foreach, mas esse permite retorno.
            if (!key && !req.body[key]) {                // O conteúdo da mensagem torna auto-explicativo as comparações.
                return res.status(400).json({ status: 400, message: 'Há uma chave e valor vazios.' });
            } else if (!key) {
                return res.status(400).json({ status: 400, message: 'Há uma chave vazia' });
            } else if (!req.body[key]) {
                return res.status(400).json({ status: 400, message: `Chave '${key}' com valor vazio.` });
            } else if (!atributos.includes(key)) {       // Checa se o nome da chave é válido
                return res.status(400).json({ status: 400, message: `A chave '${key}' não é válida. Verifique as letras maiúsculas/minúsculas e acentuação.` });
            }
        })
    }

    // Faz o parser correto para JSON, senão o arquivo é escrito como: '[object object]'
    let json = JSON.stringify(req.body);

    // Atualiza o conteúdo do info.json
    fs.writeFile('info.json', json, function (err) {
        if (err) throw err;
        res.send('O conteúdo foi atualizado com sucesso!');
    });

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

    let check = true;

    // Tenta ler o arquivo peers.json
    fs.readFile('peers.json', function (err, data) {
        if (!err) {    // Se não houver erros...
            let peers_file = JSON.parse(data);

            // Tenta ler o arquivo message.json
            if (Object.values(req.body).length === 0) {          // Checa se o JSON está vazio
                check = false
                return res.status(400).json({ status: 400, message: 'O corpo da requisição está vazio' });
            } else {
                Object.keys(req.body).some(function (key) {      // Similar ao Foreach, mas esse permite retorno.
                    if (!key && !req.body[key]) {                // O conteúdo da mensagem torna auto-explicativo as comparações.
                        check = false
                        return res.status(400).json({ status: 400, message: 'Há uma chave e valor vazios.' });
                    } else if (!key) {
                        check = false
                        return res.status(400).json({ status: 400, message: 'Há uma chave vazia' });
                    } else if (!req.body[key]) {
                        check = false
                        return res.status(400).json({ status: 400, message: `Chave '${key}' com valor vazio.` });
                    } else if (!peers.includes(key)) {          // Checa se o nome da chave é válido
                        check = false
                        return res.status(400).json({ status: 400, message: `A chave '${key}' não é válida. Verifique as letras maiúsculas/minúsculas e acentuação.` });
                    }
                });

                // Checa se todas as chaves necessárias estão inclusas
                if (check) {
                    let conteudo = JSON.stringify(req.body);

                    // Checa se há as 3 chaves: id, nome e url.
                    if (!peers.every(element => conteudo.includes(element))) {
                        check = false
                        return res.status(400).json({ status: 400, message: `É necessário ter todas as 3 chaves: 'id', 'nome' e 'url'.` });
                    }
                }
            }

            if (check) {
                for (var i = 0; i < peers_file.length; i++) {
                    if (peers_file[i].id == req.body.id || peers_file[i].nome == req.body.nome) {
                        check = false;
                        return res.status(409).json({ status: 409, message: `Já existe esse ID/Nome cadastrado.` });
                    }
                }
            }

            if (check) {
                peers_file.push(req.body);
                let json = JSON.stringify(peers_file);

                // Adiciona o novo objeto no conjunto
                fs.writeFile('peers.json', json, function (err) {
                    if (err) throw err;
                    return res.send('O peer foi adicionado corretamente!');
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

    let id = req.params.id;

    // Tenta ler o arquivo peers.json
    fs.readFile('peers.json', function (err, data) {
        if (!err) {           // Se não houver erros...
            let peers_file = JSON.parse(data);
            let check = true;

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

            // Checar se o ID solicitado pela URL é usado por algum usuário
            let check2 = true;

            // Checa se o nome e o ID solicitado para alteração já não é usado por outro usuário
            for (var i = 0; i < peers_file.length; i++) {
                if (peers_file[i].id == req.body.id || peers_file[i].nome == req.body.nome) {
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

                fs.writeFile('peers.json', json, function (err) {
                    if (err) throw err;
                    return res.status(200).json({ status: 200, message: `O peer selecionado foi alterado com sucesso!` });
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
                    return res.status(200).json({ status: 200, message: `O peer selecionado foi alterado com sucesso!` });
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
})
