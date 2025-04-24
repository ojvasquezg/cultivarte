const { GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLList,
} = require("graphql");
const db = require("../db");
const { GraphQLDate } = require("graphql-scalars");
const { GraphQLDateTime } = require("graphql-scalars");
const { DateTime } = require("luxon");

//console.log("Consultando sesiones desde el esquema");

/*Inputs*/

const eventosInputType = new GraphQLInputObjectType({
  name: "eventosInput",
  fields: {
    id: { type: GraphQLInt },
    id_eje_tematico: { type: GraphQLInt },
    id_tipo_evento: { type: GraphQLInt },
    id_ubicacion: { type: GraphQLInt },
    id_responsable: { type: GraphQLInt },
    id_nombre_evento: { type: GraphQLInt },
    aliado: { type: GraphQLString },
    descripcion_grupo: { type: GraphQLString },
    no_atencion: { type: GraphQLBoolean },
    motivo_no_atencion: { type: GraphQLString },
    desde_no_atencion: { type: GraphQLString },
    hasta_no_atencion: { type: GraphQLString },
    es_institucional: { type: GraphQLBoolean },
  },
});

const eventosSesionesInputType = new GraphQLInputObjectType({
  name: "eventosSesionesInputType",
  fields: {
    id: { type: GraphQLInt },
    id_evento: { type: GraphQLInt },
    desde: { type: GraphQLString },
    hasta: { type: GraphQLString },
  },
});

const eventosSesionesParticipantesInputType = new GraphQLInputObjectType({
  name: "eventosSesionesParticipantesInputType",
  fields: {
    id: { type: GraphQLInt },
    evento_sesiones_id: { type: GraphQLInt },
    id_participante: { type: GraphQLInt },
  },
});

/*Fin de Inputs*/

const ResponseType = new GraphQLObjectType({
  name: 'Response',
  fields: {
    respuesta: { type: GraphQLBoolean },
    mensaje: { type: GraphQLString },
  }
});

const listSesionesType = new GraphQLObjectType({
  name: "sesiones",
  fields: {
    id_sesion: { type: GraphQLInt },
    nombre_sesion: { type: GraphQLString },
    id_nombre_evento: { type: GraphQLInt },
    desde: { type: GraphQLString },
    hasta: { type: GraphQLString },
    eje_tematico: { type: GraphQLString },
    tipo_evento: { type: GraphQLString },
    ubicacion: { type: GraphQLString },
    id_eje_tematico: { type: GraphQLInt },
    id_tipo_evento: { type: GraphQLInt },
    id_ubicacion: { type: GraphQLInt },
    descripcion_grupo: { type: GraphQLString },
    aliado: { type: GraphQLString },
    id_responsable: { type: GraphQLInt },
    no_atencion: { type: GraphQLBoolean },
    motivo_no_atencion: { type: GraphQLString },
    desde_no_atencion: { type: GraphQLDateTime },
    hasta_no_atencion: { type: GraphQLDateTime },
    es_institucional: { type: GraphQLBoolean },
  },
});

const participantesSesionesType = new GraphQLObjectType({
  name: "participantesSesiones",
  fields: {
    id: { type: GraphQLInt },
    evento_sesiones_id: { type: GraphQLInt },
    id_participante: { type: GraphQLInt },
  },
});

const valorType = new GraphQLObjectType({
  name: "Valor",
  fields: {
    id: { type: GraphQLInt },
    valor: { type: GraphQLString },
  },
});
const listParametrosType = new GraphQLObjectType({
  name: "Parametros",
  fields: {
    ejesTematicos: { type: new GraphQLList(valorType) },
    tiposEventos: { type: new GraphQLList(valorType) },
    ubicaciones: { type: new GraphQLList(valorType) },
    nombresEventos: { type: new GraphQLList(valorType) },
    responsables: { type: new GraphQLList(valorType) },
    beneficiarios: { type: new GraphQLList(valorType) },
  },
});

const sqlInsertEventos = `insert into eventos
(
    id_eje_tematico,
    id_tipo_evento,
    id_ubicacion,
    id_responsable,
    id_nombre_evento,
    aliado,
    descripcion_grupo,
    no_atencion,
    motivo_no_atencion,
    desde_no_atencion,
    hasta_no_atencion,
    es_institucional
	)
	values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`;

const sqlSesiones = `select es.id id_sesion, 
en.nombre nombre_sesion, en.id id_nombre_evento,
es.desde, 
es.hasta,
et.valor eje_tematico, et.id id_eje_tematico,
te.valor tipo_evento, te.id id_tipo_evento,
ub.valor ubicacion, ub.id id_ubicacion,
e.descripcion_grupo,
e.aliado,
e.id_responsable,
e.no_atencion,
e.motivo_no_atencion,
e.desde_no_atencion,
e.hasta_no_atencion,
e.es_institucional
from	
	eventos_nombre en
	inner join
	eventos e
	on en.id=e.id_nombre_evento
	inner join
	eventos_sesiones es
	on
	e.id=es.id_evento
	inner join
	detalle_tablas_valores et
	on
	e.id_eje_tematico= et.id
	inner join
	detalle_tablas_valores te
	on
	e.id_tipo_evento= te.id
	inner join
	detalle_tablas_valores ub
	on
	e.id_ubicacion= ub.id  order by es.desde`;

const sqlEjestematico = `select null id,  ' ' valor
union select id, valor from detalle_tablas_valores 
    where tabla_valores_id=(select id from tablas_valores where nombre='Eje temático')
order by 2`;
const sqlTiposEventos = `select null id,  ' ' valor
union  select id, valor from detalle_tablas_valores where tabla_valores_id=(select id from tablas_valores where nombre='Tipo de Evento')
order by 2`;

const sqlUbicaciones = `select null id,  ' ' valor
union select id, valor from detalle_tablas_valores where tabla_valores_id=(select id from tablas_valores where nombre='Ubicación') 
order by 2`;
const sqlNombresEvento = `select null id,  ' ' valor
union select id, nombre valor from eventos_nombre order by 2`;

const sqlResponsables = `select null id,  ' ' valor
union select id, nombre valor from usuarios order by 2`;

const sqlBeneficiarios = `select null id,  ' ' valor
union SELECT id, concat(nombres,' ',apellidos,' - ',numero_documento )valor FROM public.beneficiarios
ORDER BY 2 ASC`;

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    listSesiones: {
      type: new GraphQLList(listSesionesType),
      resolve: async () => {
        try {
          // Realiza la consulta y devuelve los resultados
          const result = await db.any(sqlSesiones);
          const ajustado = result.map((row) => ({
            ...row,
            desde: DateTime.fromJSDate(row.desde)
              .setZone("America/Bogota")
              .toISO(),
            hasta: DateTime.fromJSDate(row.hasta)
              .setZone("America/Bogota")
              .toISO(),
          }));
          //console.log("Resultado:", ajustado);
          return ajustado;
        } catch (error) {
          console.error("Error al obtener sesiones:", error);
          throw new Error("No se pudieron obtener las sesiones");
        }
      },
    },
    listParametros: {
      type: listParametrosType,
      resolve: async () => {
        try {
          const ejesTematicos = await db.any(sqlEjestematico);
          const tiposEventos = await db.any(sqlTiposEventos);
          const ubicaciones = await db.any(sqlUbicaciones);
          const nombresEventos = await db.any(sqlNombresEvento);
          const responsables = await db.any(sqlResponsables);
          const beneficiarios = await db.any(sqlBeneficiarios);
          return {
            beneficiarios,
            ejesTematicos,
            tiposEventos,
            ubicaciones,
            nombresEventos,
            responsables,
          };
        } catch (error) {
          console.error("Error al obtener parámetros:", error);
          throw new Error("No se pudieron obtener los parámetros");
        }
      },
    },
    listBeneficiarios: {
      type: listParametrosType,
      resolve: async () => {
        try {
          const beneficiarios = await db.any(sqlBeneficiarios);
          return {
            beneficiarios,
          };
        } catch (error) {
          console.error("Error al obtener parámetros:", error);
          throw new Error("No se pudieron obtener los parámetros");
        }
      },
    },
    listParticipantesSesiones: {
      type: new GraphQLList(participantesSesionesType),
      args: { evento_sesiones_id: { type: GraphQLInt } },
      resolve: async (parent, args) => {
        //console.log("Sesion:", args.evento_sesiones_id);
        try {
          const sql = `select id,evento_sesiones_id,id_participante from eventos_sesiones_participantes where evento_sesiones_id=${args.evento_sesiones_id}`;
          const result = await db.any(sql);
          //console.log("Participantes:", result);
          return result;
        } catch (error) {
          console.error("Error al obtener participantes de la sesión:", error);
          throw new Error(
            "No se pudieron obtener los participantes de la sesión"
          );
        }
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    insupdEventos: {
      type: ResponseType,
      args: {
        maestra: { type: eventosInputType },
        eventosSesiones: { type: new GraphQLList(eventosSesionesInputType) }, //Este solo de adicionar
        newEventosSesionesParticipantes: {
          type: new GraphQLList(eventosSesionesParticipantesInputType),
        },
        updaEventosSesionesParticipantes: {
          type: new GraphQLList(eventosSesionesParticipantesInputType),
        },
        delEventosSesionesParticipantes: {
          type: new GraphQLList(eventosSesionesParticipantesInputType),
        },
      },
      resolve: async (
        _,
        {
          maestra,
          eventosSesiones,
          newEventosSesionesParticipantes,
          updaEventosSesionesParticipantes,
          delEventosSesionesParticipantes,
        },
        context
      ) => {
        try {
          await db.tx(async (t) => {
            if (maestra.id === 0) {
              //console.log("insertando");
              const newMaestra = await t.one(sqlInsertEventos, [
                maestra.id_eje_tematico,
                maestra.id_tipo_evento,
                maestra.id_ubicacion,
                maestra.id_responsable,
                maestra.id_nombre_evento,
                maestra.aliado,
                maestra.descripcion_grupo,
                maestra.no_atencion,
                maestra.motivo_no_atencion,
                maestra.desde_no_atencion,
                maestra.hasta_no_atencion,
                maestra.es_institucional,
              ]);
              //console.log("Nuevo ID de la maestra:", newMaestra.id);
              //console.log("Eventos sesiones:", eventosSesiones);
              maestra.id = newMaestra.id; // Actualiza el ID del reporte para usarlo más adelante
            }
            if (eventosSesiones?.length) {
              //Hay que registrar en la tabla de eventos_sesiones tantos registros como sesiones haya
              console.log("Sesiones a registrar: ", eventosSesiones);
              const queries = eventosSesiones.map((columna) =>
                t
                  .one(
                    "INSERT INTO eventos_sesiones (id_evento,desde,hasta) VALUES ($1, $2, $3) RETURNING id",
                    [maestra.id, columna.desde, columna.hasta]
                  )
                  .then((newItem) => { })
              );
              await Promise.all(queries);
            }
            if (newEventosSesionesParticipantes?.length) {
              //Hay que registrar en la tabla de eventos_sesiones tantos registros como sesiones haya
         
              const queries = newEventosSesionesParticipantes.map((columna) =>
                t
                  .one(
                    "INSERT INTO eventos_sesiones_participantes (evento_sesiones_id,id_participante) VALUES ( $1, $2) RETURNING id",
                    [maestra.id, columna.id_participante]
                  )
                  .then((newItem) => { })
              );
              await Promise.all(queries);
            }
            if (delEventosSesionesParticipantes?.length) {
              const queries = delEventosSesionesParticipantes.map((columna) =>
                db.none(
                  "DELETE FROM eventos_sesiones_participantes WHERE id = $1",
                  [columna.id]
                )
              );
              await Promise.all(queries);
            }
          });
          return {
            respuesta: true,
            mensaje: "Registro guardado correctamente!",
          };
        } catch (error) {
          //aqui termina el resolve
          //console.log("atrapa el error");
          console.error("Error en registro de eventos:", error);
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
          await db.tx(async (t) => {
            await t.none(sqlDeleteTablasValores, [id]);
          });

          return {
            respuesta: true,
            mensaje: "Registro de 'Tabla de Valores' eliminado correctamente",
          };
        } catch (error) {
          console.error("Error al eliminar tablas valores:", error);
          return { respuesta: false, mensaje: `Error:: ${error.message}` };
        }
      },
    },
  },
});

const schemaEventos = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});

module.exports = schemaEventos;
