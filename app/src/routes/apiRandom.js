const { Router } = require('express');
const apiRandom = Router();

const { fork } = require('child_process')
const random = fork('./src/api/random.js')


apiRandom.get('/:cant', (req, res) => {
    const { cant } = req.params
    random.send(cant)
    random.on('message', resultado => {
        res.json(resultado)
    })

});

apiRandom.get('/', (req, res) => {
    random.send(100000000)
    random.on('message', resultado => {
        res.json(resultado)
    })

});

exports.apiRandom = apiRandom;