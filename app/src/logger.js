const log4js = require('log4js');

log4js.configure({
  appenders: {
    consola: { type: 'console' },
    archivoWarning: { type: 'file', filename: 'warn.log' },
    archivoErrores: { type: 'file', filename: 'error.log' },
    archivoDebug: { type: 'file', filename: 'debug.log' },
    loggerConsola: {
      type: 'logLevelFilter',
      appender: 'consola',
      level: 'info',
    },
    loggerArchivoErrores: {
      type: 'logLevelFilter',
      appender: 'archivoErrores',
      level: 'error',
    },
    loggerArchivoWarning: {
      type: 'logLevelFilter',
      appender: 'archivoWarning',
      level: 'warn',
    },
  },
  categories: {
    default: {
      appenders: ['loggerConsola'],
      level: 'all',
    },
    entrega:{
      appenders: ['loggerArchivoErrores', 'loggerArchivoWarning', 'loggerConsola'],
      level: 'all'
    },
    prod: {
      appenders: ['loggerArchivoErrores', 'loggerArchivoWarning'],
      level: 'all',
    },
  },
})

let logger = null

if (process.env.NODE_ENV === 'PROD') {
  logger = log4js.getLogger('prod')
} else {
  logger = log4js.getLogger('entrega')
}


exports.logger = logger;