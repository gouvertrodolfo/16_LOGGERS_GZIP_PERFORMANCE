
const normalizr = require("normalizr")
const productos = require("./Productos").getInstancia()

/**************************************************************************************** */
const Chat = require('../daos/ContenedorMensajes')
const chat = new Chat();


/**************************************************************************************** */

class mySocket{

    constructor(io) {

        this.io = io

    };

    CrearInstancia() {

        const schema = normalizr.schema;

        // Definimos un esquema author
        const author_schema = new schema.Entity('author', {}, { idAttribute: 'correo' });

        // Definimos un esquema de mensaje
        const mensaje_schema = new schema.Entity('mensaje', {
            author: author_schema
        }, { idAttribute: '_id' });

        // Definimos un esquema de mensaje
        const mensajes_schema = new schema.Array(mensaje_schema);

        this.io.on('connection', async socket => {

            console.log('Nuevo cliente conectado!')

            let mensajes = await chat.getAll();

            const mensajes_normal = normalizr.normalize(mensajes, mensajes_schema)

            /* Envio los mensajes al cliente que se conectó */
            socket.emit('mensajes', mensajes_normal)

            const produc = await productos.listarTodo();
            socket.emit('productos', produc)

            /* Escucho los mensajes enviado por el cliente y se los propago a todos */
            socket.on('nuevoMensaje', async data => {

                mensajes = await chat.AddMensaje(data)
                const mensajes_normal = normalizr.normalize(mensajes, mensajes_schema)

                this.io.sockets.emit('mensajes', mensajes_normal)
            })

            /* Escucho los nuevos productos enviado por el cliente y se los propago a todos */
            socket.on('nuevoProducto', async prd => {

                await productos.insertar(prd)
                const listado = await productos.listarTodo();
                console.log(listado)
                this.io.sockets.emit('productos', listado)

            })

        })
    }



}

function getInstancia(io) {
   
        if (!this.instance) {
            this.instance = new mySocket(io)
            this.instance.CrearInstancia();
            return this.instance;
        }
        else {
            return this.instance;
        }

    }


module.exports = { getInstancia }
