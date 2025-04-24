const { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLSchema } = require('graphql');
const db = require('../db');


// Definir MenuItemType
const MenuItemType = new GraphQLObjectType({
  name: 'MenuItem',
  fields: {
    label: { type: GraphQLString },
    route: { type: GraphQLString }
  }
});

// Definir MenuGroupType
const MenuGroupType = new GraphQLObjectType({
  name: 'MenuGroup',
  fields: {
    label: { type: GraphQLString },
    children: { type: new GraphQLList(MenuItemType) }
  }
});

// Definir MenuResultType
const MenuResultType = new GraphQLObjectType({
  name: 'MenuResult',
  fields: {
    menu: { type: new GraphQLList(MenuGroupType) }
  }
});
// Consulta para obtener el menú del usuario
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    getUserMenu: {
      type: MenuResultType, // Usa el tipo definido arriba
      resolve: async (_, args, context) => {
        try {
          const userId = 1;
          const query = `
            SELECT DISTINCT 
              m.menu_name AS group_name,
              a.description AS item_name,
              a.url,
              a.app_name,
              m.orden,
              m.technical_name
            FROM sec_apps a
            JOIN sec_menus m ON a.menu_name = m.menu_name
            JOIN sec_groups_apps ga ON a.app_name = ga.app_name
            JOIN sec_users_groups ug ON ga.group_id = ug.group_id
            WHERE ug.user_id = $1 AND a.menu_name IS NOT NULL
            ORDER BY m.orden, a.description
          `;
          
          const menuItems = await db.any(query, [userId]);
          
          // Procesar los resultados
          const menuGroups = {};
          menuItems.forEach(item => {
            if (!menuGroups[item.group_name]) {
              menuGroups[item.group_name] = {
                label: item.group_name,
                children: []
              };
            }
            menuGroups[item.group_name].children.push({
              label: item.item_name,
              route: item.url
            });
          });
          
          // Devolver en el formato correcto
          return {
            menu: Object.values(menuGroups)
          };
          
        } catch (error) {
          console.error('Error al obtener menú:', error);
          throw new Error('No se pudo cargar el menú');
        }
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery
});