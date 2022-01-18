const express = require('express')
const session = require('express-session')
const cluster = require('cluster')
const compression = require('compression')
const {logger} = require('./logger')


/**************************************************************************************** */

const yargs = require('yargs/yargs')(process.argv.slice(2))

const args = yargs
    .option('port', {
        alias: 'p',
        default: 8081,
        type: 'number'
    })
    .option('mode', {
        alias: 'm',
        default: 'fork',
        type: 'string'
    })
    .boolean('producto_mongo')
    .boolean('user_mongo')
    .argv

/**************************************************************************************** */
/*       Cluster creando instancias                                                       */
/**************************************************************************************** */

/* MASTER */
if (args.mode === 'cluster' && cluster.isPrimary) {

    const numCPUs = require('os').cpus().length

    logger.info(`PID MASTER ${process.pid}`)

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork()

        logger.info('creando una instancia nueva...')

    }

    cluster.on('exit', worker => {
        logger.warn('Worker', worker.process.pid, 'died', new Date().toLocaleString())
        cluster.fork()
    })

} else {

    /**************************************************************************************** */
    const { Server: HttpServer } = require('http')
    const { Server: IOServer } = require('socket.io')
    /**************************************************************************************** */

    const app = express()
    const httpServer = new HttpServer(app)
    const io = new IOServer(httpServer)

    require("./api/socket").getInstancia(io)
    app.use(compression())

    /**************************************************************************************** */
    const { apiProductos } = require("./routes/apiProductos")
    const { apiProductosTest } = require("./routes/apiProductosTest")
    const { webProductos } = require("./routes/webProductos")
    const { webProductosTest } = require("./routes/webProductosTest")
    const { info } = require("./routes/info")
    const { apiRandom } = require("./routes/apiRandom")

    const routes = require('./routes/routes');
    const { passport } = require("./api/MyPassportLocal")
    const controllersdb = require('./daos/mongoose');

    /**************************************************************************************** */


    /**************************************************************************************** */
    app.use(express.static('public'))

    //Configuracion del motor de vistas que se usara
    app.set('view engine', 'ejs')

    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    /**************************************************************************************** */
    const MongoStore = require('connect-mongo')
    const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true }

    app.use(session({
        /* ------------------------------------------------------------ */
        /*           Persistencia por mongo altlas database             */
        /* ------------------------------------------------------------ */
        store: MongoStore.create({
            //En Atlas connect App :  Make sure to change the node version to 2.2.12:
            mongoUrl: 'mongodb://user:us3r@cluster0-shard-00-00.3svtz.mongodb.net:27017,cluster0-shard-00-01.3svtz.mongodb.net:27017,cluster0-shard-00-02.3svtz.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-3m6b86-shard-0&authSource=admin&retryWrites=true&w=majority',
            mongoOptions: advancedOptions
        }),
        /* ------------------------------------------------------------ */

        secret: 'shhhhhhhhhhhhhhhhhhhhh',
        resave: true,
        saveUninitialized: false,
        cookie: {
            maxAge: 600000
        }
    }))

    /**************************************************************************************** */

    app.use(passport.initialize());
    app.use(passport.session());

    /**************************************************************************************** */

    //espacio de rutas
    app.use('/api/productos', apiProductos)
    app.use('/api/productosTest', apiProductosTest)

    app.use('/', webProductos)
    app.use('/test', webProductosTest)
    app.use('/info', info)
    app.use('/api/random', apiRandom)

    // ------------------------------------------------------------------------------
    //  rutas de login Passport 
    // ------------------------------------------------------------------------------

    //  LOGIN
    app.get('/login', routes.getLogin);
    app.post('/login', passport.authenticate('login', { failureRedirect: '/faillogin' }), routes.postLogin);
    app.get('/faillogin', routes.getFaillogin);

    //  SIGNUP
    app.get('/signup', routes.getSignup);
    app.post('/signup', passport.authenticate('signup', { failureRedirect: '/failsignup' }), routes.postSignup);
    app.get('/failsignup', routes.getFailsignup);

    //  LOGOUT
    app.get('/logout', routes.getLogout);

    //  FAIL ROUTE
    app.get('*', routes.failRoute);

    /**************************************************************************************** */



    controllersdb.conectarDB(err => {

        if (err) return logger.error('error en conexión de base de datos', err);
        logger.info('BASE DE DATOS CONECTADA');

        const connectedServer = httpServer.listen(args.port, function () {
            logger.info(`Servidor Http con Websockets escuchando en el puerto ${connectedServer.address().port}`)
        })
        connectedServer.on('error', error => logger.error(`Error en servidor ${error}`))


    });

}
