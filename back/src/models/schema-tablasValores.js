// schema.js
const { GraphQLInputObjectType,GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLInt, GraphQLBoolean, GraphQLList } = require('graphql');
const db = require('../db');
const { GraphQLDate } = require('graphql-scalars');
const sessionStore = require('../sessionStore'); // Importamos la sesión

const jwt = require('jsonwebtoken');
require('dotenv').config();


const {auth} =require('../auth');

const SECRET_KEY = process.env.SECRET_KEY;


console.log("Consultando plantillas desde el esquema");

/***********************Tipos para Input**************/


const tablasValoresInputType = new GraphQLInputObjectType({
    name: 'tablasValoresInput',
    fields: {
        id: { type: GraphQLInt },
        nombre: { type: GraphQLString },
        id_usuario: { type: GraphQLInt },
        id_usuario_modificacion: { type: GraphQLInt },
        fecha_creacion: { type: GraphQLDate },
        fecha_modificacion: { type: GraphQLDate },
        id_modulo: { type: GraphQLInt },
    },
});



const newTablasValoresItemsInputType = new GraphQLInputObjectType({
    name: 'tablasValoresItemsInputType',
    fields: {
        id: { type: GraphQLInt },
        id_tabla_valor: { type: GraphQLInt },
        valor: { type: GraphQLString },
        estado: { type: GraphQLString },
        descripcion: { type: GraphQLString },
        id_usuario: { type: GraphQLInt },
        id_usuario_modificacion: { type: GraphQLInt },
        fecha_creacion: { type: GraphQLDate },
        fecha_modificacion: { type: GraphQLDate }
    },
});

/*******************Fin Tipos para Inputs******* */
/*******Tipos para Respuesta *********/
const tablasValoresType = new GraphQLObjectType({
    name: 'tablasValoresType',
    fields: {
        id: { type: GraphQLInt },
        nombre: { type: GraphQLString },
        id_usuario: { type: GraphQLInt },
        id_usuario_modificacion: { type: GraphQLInt },
        fecha_creacion: { type: GraphQLDate },
        fecha_modificacion: { type: GraphQLDate },
        id_modulo: { type: GraphQLInt },
        usuario:{ type: GraphQLString},
        usuario_modificacion:{type: GraphQLString}
    }
});

const NuevoIdType = new GraphQLObjectType({
    name: 'NuevoId',
    fields: {
        id: { type: GraphQLInt }, // ID generado
        valor: { type: GraphQLString } // Valor del registro
    }
});
const ResponseType = new GraphQLObjectType({
    name: 'Response',
    fields: {
        respuesta: { type: GraphQLBoolean },
        mensaje: { type: GraphQLString },
        data: { type: tablasValoresType },
        nuevosIds: { type: new GraphQLList(NuevoIdType) } // Lista de objetos con id y valor

    }
});





const listTablasValoresType = new GraphQLObjectType({
    name: 'listTablasValoresType',
    fields: {
        id: { type: GraphQLInt },
        nombre: { type: GraphQLString },
        usuario: { type: GraphQLString },
        modulo: { type: GraphQLString }
    },
});



/*********** Fin Tipos para Respuesta *******/



/*Consultas*/

const sqllistTablasValores = `
    SELECT 
        tv.id AS id, 
        tv.nombre AS nombre,
        u.nombre AS usuario,
        m.nombre AS modulo
    FROM 
        tablas_valores tv
    INNER JOIN usuarios u ON tv.id_usuario = u.id
    INNER JOIN modulos m ON tv.id_modulo = m.id
    ORDER BY tv.nombre`

const sqlTablasValoresPorId = `SELECT  tv.*, uc.nombre usuario, um.nombre usuario_modificacion   
FROM 
	tablas_valores tv
left outer join usuarios uc on tv.id_usuario=uc.id
left outer join usuarios um on tv.id_usuario_modificacion=um.id
where tv.id =$1`

const sqlInsertTablasValores =`INSERT INTO tablas_valores (nombre, id_modulo, id_usuario, fecha_creacion)
                                     VALUES ($1, $2, $3, now())
                                     RETURNING id, fecha_creacion,id_usuario`;
const sqlUpdateTablasValores=`update tablas_valores set nombre =$2,id_modulo=$3,id_usuario=id_usuario,id_usuario_modificacion=$4 ,fecha_modificacion = now() , fecha_creacion=fecha_creacion where id=$1 RETURNING id,fecha_creacion, fecha_modificacion,id_usuario,id_usuario_modificacion`;
const sqlDeleteTablasValores=`DELETE FROM tablas_valores WHERE id = $1`;

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        listTablasValores: {
            type: new GraphQLList(listTablasValoresType),
            resolve: async () => {
                try {
                    // Realiza la consulta y devuelve los resultados
                    const result = await db.any(sqllistTablasValores);
                    //console.log("Resultado:", result);
                    return result;
                } catch (error) {
                    console.error("Error al obtener informacion de Tablas de Valores:", error);
                    throw new Error("No se pudieron obtener las Tablas de Valores ",error);
                }
            },
        },

        tablasValoresPorId: {
            type: ResponseType,
            args: {
                id: { type: GraphQLInt }
            },
            resolve: async (_, { id },context) => {
                try {
                    //console.log("antes de obtener usuario");
                    // Realiza la consulta y devuelve los resultados
                    //console.log("usuario que consulta:",usuario);
                    let result={
                        id:0,
                        nombre: '',
                        id_usuario: null,
                        fecha_creacion: null,
                        fecha_modificacion: null,
                        id_modulo:null,
                        id_usuario_modificacion: null,
                        usuario:null,
                        usuario_modificacion:null
                      };
                    if (id!==0){
                        result = await db.one(sqlTablasValoresPorId, [id]);
                        console.log(result);
                    }
                    return {
                        respuesta: true,
                        mensaje: "Consulta exitosa",
                        data: result
                    };
                } catch (error) {
                    console.error("Error al obtener Tablas de Valores:", error);
                    throw new Error("No Se pudieron obtener las Tablas de Valores ",error);
                }
            },
        },
    },
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        insupdTablasValores: {
            type: ResponseType,
            args: {
                maestra: { type: tablasValoresInputType },
                newTablasValoresItems: { type: new GraphQLList(newTablasValoresItemsInputType) },
                updTablasValoresItems: { type: new GraphQLList(newTablasValoresItemsInputType) },
                delTablasValoresItems: { type: new GraphQLList(newTablasValoresItemsInputType) }
               
            },
            resolve: async (_, { maestra, newTablasValoresItems, updTablasValoresItems, delTablasValoresItems },context) => {
                try {
                    await db.tx(
                        async t => {
                            const usuario=obtenerIdUsuario(context);
                            if (maestra.id === 0) {
                                

                                console.log("insertando");
                                const newMaestra = await t.one(sqlInsertTablasValores,[maestra.nombre, maestra.id_modulo, usuario]
                                );
                                maestra.id = newMaestra.id; // Actualiza el ID del reporte para usarlo más adelante
                                maestra.fecha_creacion = newMaestra.fecha_creacion;
                                maestra.id_usuario=newMaestra.id_usuario;
                            } else {
                              
                                // Mostrar el query con los valores ya insertados
                                console.log("actualizando");
                                const updMaestra= await t.one(sqlUpdateTablasValores, [maestra.id, maestra.nombre, maestra.id_modulo, obtenerIdUsuario(context)])
                                maestra.id = updMaestra.id
                                maestra.fecha_creacion = updMaestra.fecha_creacion;
                                maestra.fecha_modificacion = updMaestra.fecha_modificacion;
                                maestra.id_usuario=updMaestra.id_usuario;
                                maestra.id_usuario_modificacion=updMaestra.id_usuario_modificacion
                            } 
                            if (newTablasValoresItems?.length) {
                                
                                const queries = newTablasValoresItems.map(columna =>
                                    t.one(
                                        'INSERT INTO tablas_valores_items (id_tabla_valor, valor, estado,descripcion,fecha_creacion,id_usuario) VALUES ($1, $2, $3,$4,now(),$5) RETURNING id',
                                        [maestra.id, columna.valor, columna.estado, columna.descripcion,usuario]
                                    ).then(newItem => {
                                        columna.id = newItem.id; // Actualiza el ID en el objeto columna
                                        return newItem;
                                    })      
                                    
                                    
                                );
                                await Promise.all(queries);
                            }
                           if (updTablasValoresItems?.length) {
                                console.log("Columnas a actualizar");
                                console.log(updTablasValoresItems)
                                const queries = updTablasValoresItems.map(columna =>
                                    t.none(
                                        'UPDATE tablas_valores_items SET valor = $2, estado = $3, descripcion=$4,id_usuario_modificacion=$5,fecha_modificacion=now() WHERE id = $1',
                                        [columna.id, columna.valor, columna.estado,columna.descripcion,usuario]
                                    )
                                );
                                console.log(queries);
                                await Promise.all(queries);
                            }
                           if (delTablasValoresItems?.length) {                                
                               const queries = delTablasValoresItems.map(columna =>
                                    db.none('DELETE FROM tablas_valores_items WHERE id = $1', [columna.id])
                                );
                                await Promise.all(queries);
                            }
                        }

                    )
                    return { respuesta: true, mensaje: 'Registro guardado correctamente!', data: maestra,
                        nuevosIds: newTablasValoresItems?.map(item => ({ id: item.id, valor: item.valor }))?? []
                     };
                }//aqui termina el resolve
                catch (error) {
                    console.log("atrapa el error")
                    console.error('Error en registro de tablas valores:', error);
                    return { respuesta: false, mensaje: `Error:: ${error.message}` };
                }
            },

        },
        deleteTablasValores: {
            type: ResponseType,
            args: {
                id: { type: GraphQLInt }, // El ID del reporte a eliminar
            },
            resolve: async (_, { id }) => {
                try {
                    await db.tx(async t => {
                        await t.none(sqlDeleteTablasValores, [id]);
                    });

                    return { respuesta: true, mensaje: "Registro de 'Tabla de Valores' eliminado correctamente" };
                } catch (error) {
                    console.error('Error al eliminar tablas valores:', error);
                    return { respuesta: false, mensaje: `Error:: ${error.message}` };
                }
            },
        },

    }
})

function ou(){
    console.log("usuario:",auth.obtenerUsuario());
}


const schemaTablasValores = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});

function obtenerUsuario(context) {
    sessionData = sessionStore.get('token');
    //console.log("sessionData:",sessionData);
    let decoded;
    try { 
       // console.log(`SECRETOS:${SECRET_KEY}`);
        decoded = jwt.verify(sessionData, SECRET_KEY);
      //  console.log("obteniendo usuario:",decoded);
    } catch (error) {
      throw new Error('Token inválido o expirado', error);
    }
    return decoded.usuario; // 👈 Devuelve el usuario desde el token
  }

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

module.exports = schemaTablasValores; 