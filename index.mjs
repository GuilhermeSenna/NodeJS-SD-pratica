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

app.post('/', (req, res) => {
    res.send('Hello Post!')
});

app.listen(process.env.PORT || 8000, () => {
    console.log('App Started...');
})