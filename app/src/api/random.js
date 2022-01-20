const {logger} = require('../logger')

let numeros = new Map()

function getRandomInt() {
    return Math.floor(Math.random() * 10000);
}

const generateRandom = (cant) => {

    let i = 0
    let number
    let valor
    let resultado = []

    logger.info(`Inicia generateRandom para ${cant} valores`)

    numeros = new Map()
    while (i < cant) {
        number = getRandomInt();
        valor = numeros.get(number)

        if (valor === undefined) { numeros.set(number, 0) }
        else {

            valor = valor + 1
            numeros.set(number, valor++)
        }
        i++;
    }

    for (const [numero, cantOcu] of numeros) {
        resultado.push({ 'numero': numero, 'ocurrencias': cantOcu })
    }

   logger.info(`fin generateRandom`)
   return resultado;
}

process.on('message', msg => {
    logger.info(`proceso no bloqueante`)
    const response = generateRandom(msg)
    process.send(response)
})

module.exports =  {generateRandom}