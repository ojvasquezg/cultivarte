const { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLInt, GraphQLBoolean, GraphQLList } = require('graphql');
const db = require('../db');
const { GraphQLDate } = require('graphql-scalars');

console.log("Consultando modulos desde el esquema");

const listModulosType = new GraphQLObjectType({
    name: 'modulos',
    fields: {
        id: { type: GraphQLInt },
        nombre: { type: GraphQLString },
    },
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        listModulos: {
            type: new GraphQLList(listModulosType),
            resolve: async () => {
                try {
                    // Realiza la consulta y devuelve los resultados
                    const result = await db.any('SELECT * FROM modulos order by nombre');
                    //console.log("Resultado:", result);
                    return result;
                } catch (error) {
                    console.error("Error al obtener Moduloss:", error);
                    throw new Error("No se pudieron obtener los modulos");
                }
            },
        },
    },
});




const schemaModulos = new GraphQLSchema({
    query: RootQuery,
});

module.exports = schemaModulos; 