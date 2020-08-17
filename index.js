const mongoose = require('mongoose');
require('./config/db');
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars'); //exphbs significa express-handlebars ES UNA CONVENCION LLAMARLO ASI
const Handlebars = require('handlebars')
const router = require('./routes'); //Se importa el router.
const app = express();
require('dotenv').config({ path: 'variables.env' });
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require("connect-mongo")(session); //Esta sintaxis permite pasar variables (session) al paquete.
const bodyParser = require('body-parser'); //Permite ver los datos enviados por POST con body.req
//const expressValidator = require('express-validator'); //Permite usar metodos, para sanatizar entradas, revisar que un campo sea igual a otro, revisar si un campo esta vacio, etc.
const flash = require("connect-flash"); //Para mostrar mensajes
const createError = require("http-errors")
const passport = require("./config/passport");

//Habilitar body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Habilitar validacion de campos con expressValidator
//app.use(validationResult());

//Habilitar handlebars
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')
app.engine('handlebars',
    exphbs({
        defaultLayout: 'layout', //Handlebars va a buscar ese archivo en la carpeta layouts
        helpers: require('./helpers/handlebars'),
        handlebars: allowInsecurePrototypeAccess(Handlebars) //Permite usar el #each IMPORTANTISIMO
    })
);
//Decirle a express que usaremos handlebars como template engine.
app.set('view engine', 'handlebars');

//Static files:
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false, //Siempre que se crean sesion, en la bd se guardan. Esto lo que hace es que no las guarde otra vez.
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
//Inicializar passport
app.use(passport.initialize());
app.use(passport.session());


//Para evitar deprecated messages de mongoose.
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

//Alertas y flash messages
app.use(flash());

//Crear nuestro middleware
app.use((req, res, next) => {
    res.locals.mensajes = req.flash();
    next();
});

app.use('/', router());
//404 pagina no existente.
app.use((req, res, next) => {
    next(createError(404, 'No encontrado.'));
});
//Administracion de los errores.
app.use((error, req, res, next) => {
    //Cuando pasas una variable a locals no es necesario pasarselo a la vista como en otras ocasiones.
    res.locals.mensaje = error.message;
    const status = error.status || 500;
    res.locals.status = status;
    res.status(status);
    res.render("error");
});
//Dejar que Heroku asigne el puerto a la aplicacion.
//Servidor y puerto
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 5000;

app.listen(port, host, () => {
    console.log('El servidor esta funcionando' + ' en el puerto ' + port + ' y en el host ' + host);

});
