import express from 'express';


const app = express()

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

app.get('/', (req, res) => {
    res.send('Rotas: /clientes, /pag1, /pag2, /pag3, /hello')
});

app.get('/resolver', (req, res) => {

    // Objeto 'links' com o nome dos alunos e seus respectivos deploys
    let links = {
        'hiago': 'https://sd-api-uesc.herokuapp.com/',
        'robert': 'https://pratica-sd.herokuapp.com/',
        'luis': 'https://sd-20212-luiscarlos.herokuapp.com/',
        'joao': 'https://sd-joaopedrop-20212.herokuapp.com/',
        'guilherme': 'https://nodejs-sd-guilhermesenna.herokuapp.com/',
        'allana': 'https://sd-ascampos-20212.herokuapp.com/',
        'jenilson': 'https://jenilsonramos-sd-20211.herokuapp.com/',
        'emmanuel': 'https://sd-emmanuel.herokuapp.com/'
    }

    if(!req.query.nome){                                // Caso acesse o link sem passar parametro
        res.send(links);                                // Mostra o objeto links para o usuário poder escolher
    }else{                                              // Caso passe o parametro
        let nome = req.query.nome;                      // Armazena o parametro na variavel nome
        if (links[`${nome}`] !== undefined){            // Checa se o nome/parametro é uma chave (aluno) do objeto
            res.send(links[nome]);                      // Caso seja mostra o valor da chave (link)
        }else{
            res.send('Não existe esse nome na lista.'); // Caso não esteja no objeto, avisa ao usuário
        }
    }
});

app.post('/', (req, res) => {
    res.send('Hello Post!')
});

app.listen(process.env.PORT || 8000, () => {
    console.log('App Started...');
})
