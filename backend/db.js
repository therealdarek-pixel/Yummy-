
//  Aquí nos conectamos a la base de datos una sola vez.

const { MongoClient } = require("mongodb");
const URL = process.env.MONGO_URL || "mongodb://localhost:27017";

//nombre de la base de datos
const NOMBRE_BD = "didifood";

const cliente = new MongoClient(URL);
let bd; // aquí guardamos la base de datos 

// Esta función conecta una sola vez y siempre devuelve la misma base.
async function conectar() {
  if (!bd) {
    await cliente.connect();
    bd = cliente.db(NOMBRE_BD);
    console.log("Conectado a MongoDB ✅");
  }
  return bd;
}

module.exports = { conectar };