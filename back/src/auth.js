require('dotenv').config();

const { GraphQLObjectType, GraphQLSchema, GraphQLString } = require('graphql');
const db = require('./db');
const CryptoJS = require('crypto-js');
const bcrypt = require('bcryptjs');
const sessionStore = require('./sessionStore'); // Importamos la sesión

const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;


// Definición del tipo de autenticación
const AuthType = new GraphQLObjectType({
  name: 'Auth',
  fields: {
    message: { type: GraphQLString },
    token: { type: GraphQLString } // Agregar token en la respuesta si lo necesitas en el frontend
  }
});

// Definición de la consulta para verificar el usuario
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    authenticate: {
      type: AuthType,
      args: {
        usuario: { type: GraphQLString },
        password: { type: GraphQLString }
      },
      resolve: async (_, { usuario, password }, context) => { // 👈 AHORA RECIBE `context`
        try {
          var clave = descifrar(password, usuario);
          console.log("usuario:",usuario," password:",password);
          console.log("clave:",clave);
          if(clave==="")clave=" ";
          console.log("cifrado:",(await cifrar2(clave)).toString());
          const query = 'SELECT * FROM usuarios WHERE usuario = $1';
          const result = await db.any(query, [usuario]);
          if (result.length > 0) {
            const user = result[0];
            const match = await bcrypt.compare(clave, user.password);
            if (match) {
              console.log("Autenticación exitosa");
              const dataToken = jwt.sign(
                {
                  usuario: user.usuario,
                  id_usuario:user.id,
                  ip: context.req.ip,
                  userAgent: context.req.headers['user-agent']
                }, // Datos que se incluyen en el token
                SECRET_KEY,
                { expiresIn: '8h' } // Duración del token
              );
              if (context && context.res) {
                sessionStore.set('token', dataToken);
                //console.log("sessionStore:", sessionStore);
                context.res.cookie('idSession', cifrar(usuario, SECRET_KEY), {
                  httpOnly: true,
                  secure: false,  // Cambiar a `true` en producción si usas HTTPS
                  sameSite: 'Strict',
                  maxAge: (3600000 * 8) // 1 hora (ajústalo según necesidad)
                });
                context.res.cookie('token', dataToken, {
                  httpOnly: true,
                  secure: false,  // Cambiar a `true` en producción si usas HTTPS
                  sameSite: 'Strict',
                  maxAge: (3600000 * 8) // 1 hora (ajústalo según necesidad)
                });

              }
              return { message: true };
            } else {
              context.res.cookie('token', '', { expires: new Date(0), httpOnly: true });
              console.log("Clave incorrecta");
              return { message: false };
            }

          } else {
            context.res.cookie('token', '', { expires: new Date(0), httpOnly: true });
            console.log("Autenticacion fallida");
            return { message: false };
          }
        } catch (error) {
          console.error("Error en la autenticación:", error);
          context.res.cookie('token', '', { expires: new Date(0), httpOnly: true });
          console.log("Autenticacion fallida");
          return { message: false };
        }
      }
    },
    obtenerUsuario: {
      type: GraphQLString, // Tipo de dato que devuelve el resolver 
      resolve: async (_, {  }, context) => { // 👈 Recibe `context`
        sessionData = sessionStore.get('token');
        //console.log("token:",token);
        //console.log("sessionData:",sessionData);
        let decoded;
        try {
          decoded = jwt.verify(sessionData, SECRET_KEY);
          //console.log("decodificiado:", decoded)
        } catch (error) {
          throw new Error('Token inválido o expirado', error);
        }

        ;
        // Devolver el nombre de usuario
        return decoded.usuario; // 👈 Devuelve el usuario desde el token
      },
    },
  }
});

// Esquema de GraphQL
const schemaAuth = new GraphQLSchema({
  query: RootQuery
});

function verificarToken(req, res) {
  //console.log("req");
  // console.log(req);
  const token = req.cookies.token; // ✅ Leer la cookie (se envía automáticamente)
  const idSession = req.cookies.idSession;
  if (!token || !(sessionStore.get('token') === token)) {
    deleteToken(res)
    return res.status(401).json({ authenticated: false });
  }
  sessionData = sessionStore.get('token');
  var decoded;
  try {
    decoded = jwt.verify(token, SECRET_KEY);
  } catch (error) {

    console.error("Error al verificar el token:", error);
    return res.status(401).json({ message: "Error al verificar el token:", error });
  }
  //console.log("Datos del token:", decoded);
  if (decoded.ip !== req.ip || decoded.userAgent !== req.headers['user-agent']) {
    // console.log("deleteToken 2")
    deleteToken(res)
    return res.status(401).json({ message: 'Sesión no valida' });
  }
  //console.log("pasa validaciones");
  try {
   //Todo en orden
    login = descifrar(idSession, SECRET_KEY);
    //console.log("usuario descifrado en validar", login);
    const dataToken = jwt.sign(
      {
        usuario: login,
        id_usuario:decoded.id_usuario,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      }, // Datos que se incluyen en el token
      SECRET_KEY,
      { expiresIn: '8h' } // Duración del token
    );
    sessionStore.set('token', dataToken);
    res.cookie('token', dataToken, {
      httpOnly: true,
      secure: false,  // Cambiar a `true` en producción si usas HTTPS
      sameSite: 'Strict',
      maxAge: (3600000 * 8) // 1 hora (ajústalo según necesidad)

    });
    res.cookie('idSession', cifrar(login, SECRET_KEY), {
      httpOnly: true,
      secure: false,  // Cambiar a `true` en producción si usas HTTPS
      sameSite: 'Strict',
      maxAge: (3600000 * 8) // 1 hora (ajústalo según necesidad)

    });

    return res.json({ authenticated: true, user: decoded.usuario });
  } catch (error) {
    console.log("hay error:", error);
    autenticacion.deleteToken(res)
    return res.status(401).json({ authenticated: false });
  }
}


function deleteToken(res) {
  res.cookie('token', '', {
    expires: new Date(0), // 🔥 Expira inmediatamente
    httpOnly: true,
    sameSite: 'Strict',
  });

}

function obtenerIdUsuario(context) {
  sessionData = sessionStore.get('token');
  console.log("sessionData:",sessionData);
  let decoded;
  try { 
     // console.log(`SECRETOS:${SECRET_KEY}`);
      decoded = jwt.verify(sessionData, SECRET_KEY);
      console.log("obteniendo id usuario:",decoded);
  } catch (error) {
    throw new Error('Token inválido o expirado', error);
  }
  return decoded.id_usuario; // 👈 Devuelve el usuario desde el token
}


function descifrar(valor, key) {
  const bytes = CryptoJS.AES.decrypt(valor, key);
  var textoDescifrado;
  textoDescifrado = bytes.toString(CryptoJS.enc.Utf8);

  return textoDescifrado;
}

function cifrar(valor, key) {
  const cifrado = CryptoJS.AES.encrypt(valor, key).toString();
  return cifrado;
}

function obtenerUsuario(context) {
    sessionData = sessionStore.get('token');
    let decoded;
    try {
      decoded = jwt.verify(sessionData, SECRET_KEY);
      //console.log("obteniendo usuario:",decoded);
    } catch (error) {
      throw new Error('Token inválido o expirado', error);
    }
    return decoded.usuario; // 👈 Devuelve el usuario desde el token
  }

  function cifrar2(valor) {
    const saltRounds = 10; // Número de rondas de cifrado
    const hashedPassword =  bcrypt.hash(valor, saltRounds); // 🔥 Esperar el resultado con `await`
    console.log("cifrar2:",hashedPassword)
    return hashedPassword;
  }

//module.exports = { schemaAuth };
module.exports = schemaAuth;
module.exports.deleteToken = deleteToken;
module.exports.cifrar = cifrar;
module.exports.descifrar = descifrar;
module.exports.verificarToken = verificarToken;
module.exports.obtenerUsuario=obtenerUsuario;



/*  const saltRounds = 10; // Número de rondas para fortalecer el hash
  var hashedPassword =  ""
  bcrypt.hash("1234", saltRounds)
    .then(hashedPassword => {
      console.log("Clave hasheada:", hashedPassword); // Ver el hash generado
 
      
    })
    .then(() => {
      console.log("Usuario registrado con clave segura.");
    })
    .catch(error => {
      console.error("Error al registrar usuario:", error);
    });
  */
