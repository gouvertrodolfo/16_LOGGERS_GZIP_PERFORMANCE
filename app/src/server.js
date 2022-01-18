const express = require('express')
const session = require('express-session')
const cluster = require('cluster')
const compression = require('compression')

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

    console.log(`PID MASTER ${process.pid}`)

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork()

        console.log('creando una instancia nueva...')

    }

    cluster.on('exit', worker => {
        console.log('Worker', worker.process.pid, 'died', new Date().toLocaleString())
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

    // const normalizr = require("normalizr")
    // // const normalize = normalizer.normalize;
    // const schema = normalizr.schema;

    // // Definimos un esquema author
    // const author_schema = new schema.Entity('author', {}, { idAttribute: 'correo' });

    // // Definimos un esquema de mensaje
    // const mensaje_schema = new schema.Entity('mensaje', {
    //     author: author_schema
    // }, { idAttribute: '_id' });

    // // Definimos un esquema de mensaje
    // const mensajes_schema = new schema.Array(mensaje_schema);

    // /**************************************************************************************** */

    // io.on('connection', async socket => {

    //     console.log('Nuevo cliente conectado!')

    //     let mensajes = await chat.getAll();

    //     const mensajes_normal = normalizr.normalize(mensajes, mensajes_schema)

    //     /* Envio los mensajes al cliente que se conectó */
    //     socket.emit('mensajes', mensajes_normal)

    //     const produc = await productos.listarTodo();
    //     socket.emit('productos', produc)

    //     /* Escucho los mensajes enviado por el cliente y se los propago a todos */
    //     socket.on('nuevoMensaje', async data => {

    //         mensajes = await chat.AddMensaje(data)
    //         const mensajes_normal = normalizr.normalize(mensajes, mensajes_schema)

    //         io.sockets.emit('mensajes', mensajes_normal)
    //     })

    //     /* Escucho los nuevos productos enviado por el cliente y se los propago a todos */
    //     socket.on('nuevoProducto', async prd => {

    //         await productos.insertar(prd)
    //         const listado = await productos.listarTodo();
    //         console.log(listado)
    //         io.sockets.emit('productos', listado)

    //     })

    // })

    /**************************************************************************************** */

    controllersdb.conectarDB(err => {

        if (err) return console.log('error en conexión de base de datos', err);
        console.log('BASE DE DATOS CONECTADA');

        const connectedServer = httpServer.listen(args.port, function () {
            console.log(`Servidor Http con Websockets escuchando en el puerto ${connectedServer.address().port}`)
        })
        connectedServer.on('error', error => console.log(`Error en servidor ${error}`))


    });

}
