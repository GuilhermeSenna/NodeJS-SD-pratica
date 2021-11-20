var express = require('express');
var router = express.Router();
var fs = require('fs');
const functions = require("../modules/functions");

// [GET] /peers
router.get('/peers', (req, res) => {

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
router.post('/peers', (req, res) => {

    // Lista com as chaves possíveis de serem adicionadas
    let peers = [
        'id',
        'nome',
        'url'
    ];

    // Tenta ler o arquivo peers.json
    fs.readFile('peers.json', function (err, data) {
        if (!err) {    // Se não houver erros...
            let peers_file = JSON.parse(data);

            let { check, mensagem } = functions.checagens_iniciais(peers, req.body);

            if (!check) {
                return res.status(400).json({ status: 400, message: mensagem });
            }

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
                let json = JSON.stringify(peers_file, null, 4);

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
});


// [GET] /peers
router.get('/peers/:id', (req, res) => {

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
router.put('/peers/:id', (req, res) => {

    let peers = [
        'id',
        'nome',
        'url'
    ];

    // resetar()

    let id = req.params.id;

    // Tenta ler o arquivo peers.json
    fs.readFile('peers.json', function (err, data) {
        if (!err) {           // Se não houver erros...
            let peers_file = JSON.parse(data);

            let { check, mensagem } = functions.checagens_iniciais(peers, req.body);

            if (!check) {
                return res.status(400).json({ status: 400, message: mensagem });
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
                var json = JSON.stringify(peers_file, null, 4);

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
router.delete('/peers/:id', (req, res) => {

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
                var json = JSON.stringify(peers, null, 4);
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

router.post('/resolver', (req, res) => {

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


module.exports = router;