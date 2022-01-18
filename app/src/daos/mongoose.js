const mongoose = require('mongoose');
const {database} = require("../../options/mongoDB");

let baseDeDatosConectada = false;
const stringConection = database.url.replace('<username>', process.env.MONGO_DB_USER).replace('<password>', process.env.MONGO_DB_PASSWORD)

function conectarDB( cb) {
    mongoose.connect(stringConection, { useNewUrlParser: true, useUnifiedTopology: true }, err => {
      if(!err) {
        baseDeDatosConectada = true;
      }
      if(cb != null) {
        cb(err);
      }
  });
}

module.exports = {
  conectarDB
}
