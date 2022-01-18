
const ProductosKnex = require("../daos/ProductosKnex");


function CrearInstancia() {
    const instance = new ProductosKnex();
    return instance;
}

function getInstancia() {
    if (!this.ContenedorProductos) {
        this.ContenedorProductos = CrearInstancia();
    }

    return this.ContenedorProductos;
}

module.exports = { getInstancia }
