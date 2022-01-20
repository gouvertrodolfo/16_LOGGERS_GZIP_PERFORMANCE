const { Router } = require('express');
const apiRandom = Router();

const { fork } = require('child_process')
const random = fork('./src/api/random.js')
const {generateRandom} = require('../api/random') 


apiRandom.get('/bloq/:cant', (req, res) => {
    const { cant } = req.params
    const resultado = generateRandom(cant)
    res.json(resultado)

});

apiRandom.get('/bloq/', (req, res) => {
    const resultado =generateRandom(100000000)
        res.json(resultado)
});


apiRandom.get('/nobloq/:cant', (req, res) => {
    const { cant } = req.params
    random.send(cant)
    random.on('message', resultado => {
        res.json(resultado)
    })

});

apiRandom.get('/nobloq/', (req, res) => {
    random.send(100000000)
    random.on('message', resultado => {
        res.json(resultado)
    })

});

exports.apiRandom = apiRandom;