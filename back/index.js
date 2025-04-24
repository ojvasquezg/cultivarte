require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const db = require("./src/db");
const schemaAuth = require('./src/auth')
//const authMiddleware = require('./src/authMiddleware'); // Importar middleware
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 59004;
const schema = require('./src/schema.js');
const auth = require('./src/auth.js');


// Middleware CORS y JSON
app.use(cors({
  origin: 'http://localhost:4200',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Definir resolvers (cómo responder a las consultas)
const root = {
  mensaje: () => "¡Servidor GraphQL funcionando sin Apollo! 🚀"
};

app.use('/eventtracker/graphql', (req, res) => {
  graphqlHTTP({
    schemaAuth: schemaAuth,
    schema: schema,
    rootValue: root,
    graphiql: true, // Solo para pruebas
    context: { req, res } // ✅ Aquí ya existen req y res
  })(req, res);
});

app.get('/eventtracker/api/auth/validate', (req, res) => {
  //console.log("llamado a validate");
  return auth.verificarToken(req,res);
 
});



// Iniciar servidor Express

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}/eventtracker/graphql`);
});


