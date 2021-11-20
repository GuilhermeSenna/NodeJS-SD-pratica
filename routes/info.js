var express = require('express');
var router = express.Router();
var fs = require('fs');
const functions = require("../modules/functions");


// [GET] /info
router.get('/info', (req, res) => {
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
router.put('/info', (req, res) => {

    // Lista com as chaves possíveis de serem adicionadas
    let atributos = [
        'server_name',
        'server_endpoint',
        'descricao',
        'versao',
        'status',
        'tipo_de_eleicao_ativa'
    ]

    let { check, mensagem } = functions.checagens_iniciais(atributos, req.body);



    if (!check) {
        return res.status(400).json({ status: 400, message: mensagem });
    }

    if (check) {
        // Faz o parser correto para JSON, senão o arquivo é escrito como: '[object object]'

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
                    var json = JSON.stringify(peers_file, null, 4);
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


module.exports = router;