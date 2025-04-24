const { mergeSchemas } = require('@graphql-tools/schema');
const schemaTablasValores = require('./models/schema-tablasValores');
const schemaAuth = require('./auth');
const schemaModulos =require('./models/schema-modulos');
const schemaTablasValoresItems =require("./models/schema-tablasValoresItems");
const schemaMenu = require("./models/schema-menu"); // 👈 Nuevo schema
const schemaEventos = require('./models/schema-eventos');

const schema = mergeSchemas({
  schemas: [schemaTablasValores,schemaAuth,schemaModulos,schemaTablasValoresItems,schemaMenu, schemaEventos ],
});
console.log('Queries disponibles:', Object.keys(schema.getQueryType().getFields()));


module.exports = schema; 

