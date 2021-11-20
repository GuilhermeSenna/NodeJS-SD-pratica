var express = require('express');
var router = express.Router();
var fs = require('fs');
const default_values = require("../modules/default");

let json_info = JSON.stringify(default_values.info_default, null, 4);
let json_peers = JSON.stringify(default_values.peers_default, null, 4);

router.get('/reset', (req, res) => {
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

router.get('/', (req, res) => {
    res.send('Rotas: /clientes, /pag1, /pag2, /pag3, /hello, /resolver, /info, /peers, /peers/ID')
});

router.post('/', (req, res) => {
    res.send('Hello Post!')
});

router.get('/hello', (req, res) => {
    if (req.query.name) {
        res.send(`Hello ${req.query.name}!`)
    }
    else {
        res.send('Hello World!')
    }
});

router.get('/clientes', (req, res) => {
    res.send(['Mathias', 'José', 'Thiago'])
});

router.get('/pag1', (req, res) => {
    res.send('Página 1')
});

router.get('/pag2', (req, res) => {
    res.send('Página 2')
});

router.get('/pag3', (req, res) => {
    res.send('Página 3')
});

module.exports = router;