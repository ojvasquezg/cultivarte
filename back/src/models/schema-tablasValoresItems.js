// schema.js
const { GraphQLInputObjectType, GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLInt, GraphQLBoolean, GraphQLList } = require('graphql');
const { GraphQLDate } = require('graphql-scalars');

const db = require('../db');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

console.log("Consultando tablasvaloresitems desde el esquema");

/***********************Tipos para Input**************/



/************************Fin Tipos para Inputs*********/

/************************Tipos para Respuesta**********/
const tablasValoresItemsType = new GraphQLObjectType({
    name: 'tablasValoresItems',
    fields: {
        id: { type: GraphQLInt },
        id_tabla_valor: { type: GraphQLInt },
        valor: { type: GraphQLString },
        estado: { type: GraphQLString },
        descripcion: { type: GraphQLString },
        fecha_creacion: { type: GraphQLDate },
        fecha_modificacion: { type: GraphQLDate },
        id_usuario: { type: GraphQLInt },
        id_usuario_modificacion:{ type: GraphQLInt }
    },
});


/************************Fin Tipos para Respuesta******/



/*Consultas*/

const sqllistTablasValoresItems = `SELECT * FROM tablas_valores_items where id_tabla_valor =$1 order by valor`;
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        listTablasValoresItems: {
            type: new GraphQLList(tablasValoresItemsType),
            args: { maestraId: { type: GraphQLInt } },
            resolve: async (_, { maestraId },context) => {
                //const usuario=obtenerIdUsuario(context);

                try {
                    // Realiza la consulta y devuelve los resultados
                    console.log("querie:",sqllistTablasValoresItems,":",maestraId);
                    const result = await db.any(sqllistTablasValoresItems, [maestraId]);
                    return result;
                } catch (error) {
                    console.error("Error al obtener valores:", error);
                    throw new Error("No se pudieron obtener los valores items");
                }
            },
        },


    },
});


function obtenerIdUsuario(context) {
    sessionData = sessionStore.get('token');
    console.log("sessionData:",sessionData);
    let decoded;
    try { 
        console.log(`SECRETOS:${SECRET_KEY}`);
        decoded = jwt.verify(sessionData, SECRET_KEY);
        console.log("obteniendo id usuario:",decoded);
    } catch (error) {
      throw new Error('Token inválido o expirado', error);
    }
    return decoded.id_usuario; // 👈 Devuelve el usuario desde el token
  }

const schemaTablasValoresItems = new GraphQLSchema({
    query: RootQuery
});


module.exports = schemaTablasValoresItems; 