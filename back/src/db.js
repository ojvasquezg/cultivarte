require('dotenv').config(); // Cargar variables de entorno

const pgp = require('pg-promise')(); // Llama a la función directamente

//console.log("clave: ",process.env.DB_USER);
// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: process.env.DB_OPTIONS
};

console.log("Conectando");
const db = pgp(dbConfig); // Conecta la base de datos

// Verifica la conexión
db.connect()
  .then(obj => {
    console.log("Conectado a la base de datos:", dbConfig.database); // Usa el objeto dbConfig
    obj.done(); // Libera la conexión
  })
  .catch(error => {
    console.error("Error de conexión:", error.message || error);
  });


  module.exports = db;
