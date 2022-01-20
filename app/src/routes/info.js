const { Router } = require('express');
require('dotenv').config()
const yargs = require('yargs/yargs')(process.argv.slice(2))
const nuCPU = require('os').cpus().length
const info = Router();
const {logger} = require('../logger')

info.get('/', (req, res) => {

    logger.warn('get info');    

    const info = {
        'Argumentos_Entrada': yargs,
        'Path': process.execPath,
        'SO:': process.platform,
        'id_proceso ': process.pid,
        'Node_version': process.version,
        'Carpeta_Proyecto': process.cwd(),
        'Memoria': process.memoryUsage().rss,
        'Cpu': nuCPU
    }

    res.json(info)
});


exports.info = info;