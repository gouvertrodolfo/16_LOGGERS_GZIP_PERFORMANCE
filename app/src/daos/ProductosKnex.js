require('dotenv').config()
const { options } = require('../../options/mariaDB')
options.connection.user = process.env.MARIA_DB_USER
options.connection.password = process.env.MARIA_DB_PASSWORD

const knex = require('knex')(options)

class ProductosKnex {

    constructor() {
        this.crearTabla();
    }

    async crearTabla() {

        try {

            await knex.schema.hasTable('productos').then(function (exists) {
                if (!exists) {

                    knex.schema.createTable('productos', table => {
                        table.increments()
                        table.string('title')
                        table.string('price')
                        table.string('thumbnail')
                    })
                        .then(console.log("tabla productos creada"))
                        .catch((err) => { console.log(err); throw err })
                        .finally(() => { knex.destroy() })


                    console.log('Tabla productos creada!');
                }
                else { console.log('La tabla productos ya existe!'); }
            })
        } catch (error) {
            console.log(error);
        }
    }

    async listarTodo() {
        try {
            const listaproductos = await knex.select().from('productos').orderBy('id', 'desc')
            return listaproductos;
        } catch (err) { console.log(err) }

    }

    async insertar(object) {

        let nuevo_id

        const { title, price, thumbnail } = object

        try {
            nuevo_id = await knex('productos')
                .insert({
                    title: title,
                    price: price,
                    thumbnail: thumbnail
                })
                .then(JSON.parse)

        }
        catch (error) {
            console.log(`Error al guardar archivo ${error}`)
        }

        object.id = nuevo_id;

        return nuevo_id;

    }

    async listarPorId(clave) {

        try {
            const producto = await knex.select().from('productos').where('id', clave)
            return producto
        } catch (err) { console.log(err) }

    }

    async borrarPorId(clave) {

        let array = [];

        try {
            await knex('productos').where('id', clave).del()

            this.listaproductos = await knex.select().from('productos').orderBy('id', 'desc')
        }
        catch (error) {
            console.log(`Error al eliminar ${error}`)
        }

    }

    async borrarTodo() {
        const items = []
        try {
            knex('productos').truncate()
        }
        catch (error) {
            console.log(`Error al truncar ${error}`)
        }

        this.listaproductos = []

    }

    async actualizar(clave, data) {
        try {
            const { title, price, thumbnail } = data

            await knex('productos').where('id', clave).update({
                title: title,
                price: price,
                thumbnail: thumbnail
            });

            this.listaproductos = await knex.select().from('productos').orderBy('id', 'desc')
        }
        catch (error) {
            console.log(`Error al actualizar ${error}`)
        }
    }
}

module.exports = ProductosKnex