// Módulos
var express = require('express');
var app = express();
var expressSession = require('express-session');
app.use(expressSession({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));
var cry

var crypto = require('crypto');

var fileUpload = require('express-fileupload');
app.use(fileUpload());
var mongo = require('mongodb');
var swig = require('swig');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app, mongo);

/*
mongodb://admin:sdi@tiendamusica-shard-00-00-jnakn.mongodb.net:27017,tiendamusica-shard-00-01-jnakn.mongodb.net:27017,tiendamusica-shard-00-02-jnakn.mongodb.net:27017/test?ssl=true&replicaSet=tiendamusica-shard-0&authSource=admin&retryWrites=true
*/
// Variables
app.set('port', 8081);

app.set('db', 'mongodb://admin:sdi@tiendamusica-shard-00-00-jnakn.mongodb.net:27017,tiendamusica-shard-00-01-jnakn.mongodb.net:27017,tiendamusica-shard-00-02-jnakn.mongodb.net:27017/test?ssl=true&replicaSet=tiendamusica-shard-0&authSource=admin&retryWrites=true');
app.set('clave', 'abcdefg');
app.set('crypto', crypto);

// routerUsuarioSession
var routerUsuarioSession = express.Router();
routerUsuarioSession.use(function (req, res, next) {
    console.log("routerUsuarioSession");
    if (req.session.usuario) {
        // dejamos correr la petición
        next();
    } else {
        console.log("va a : " + req.session.destino)
        res.redirect("/identificarse");
    }
});
//Aplicar routerUsuarioSession
app.use("/canciones/agregar", routerUsuarioSession);
app.use("/publicaciones", routerUsuarioSession);


//routerAudios
var routerAudios = express.Router();
routerAudios.use(function (req, res, next) {
    console.log("routerAudios");
    var path = require('path');
    var idCancion = path.basename(req.originalUrl, '.mp3');
    gestorBD.obtenerCanciones(
        { id: mongo.ObjectID(idCancion) }, function (canciones) {
            if (req.session.usuario && canciones[0].autor == req.session.usuario) {
                next();
            } else {
                res.redirect("/tienda");
            }
        })
});
//Aplicar routerAudios
app.use("/audios/", routerAudios);



app.use(express.static('public'));


//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app, swig, gestorBD);
require("./routes/rcanciones.js")(app, swig, gestorBD);
// lanzar el servidor
app.listen(app.get('port'), function () {
    console.log("Servidor activo");
})
