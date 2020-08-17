const emailConfig = require('../config/email');
const nodemailer = require('nodemailer');
const path = require('path');
const hbs = require('nodemailer-express-handlebars');
const util = require('util');
//Importar las variables de entorno:
require('dotenv').config({ path: 'variables.env' });

let transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL, // user
        pass: process.env.PASSWORDEMAIL // password
    }
});

// Utilizar templates de handlebars
transport.use('compile', hbs({
    viewEngine: {
        extName: '.handlebars',
        defaultLayout: '',
        partialsDir: path.resolve(__dirname + '/../views/emails'),
        layoutsDir: path.resolve(__dirname + '/../views/emails'),
    },
    viewPath: __dirname + '/../views/emails',
    extName: '.handlebars',
}))

exports.enviar = async(opciones) => {

    const opcionesEmail = {
        from: process.env.EMAIL,
        to: opciones.usuario.email,
        subject: opciones.subject,
        template: opciones.archivo,
        context: {
            resetUrl: opciones.resetUrl
        },
    };

    const sendMail = util.promisify(transport.sendMail, transport);
    return sendMail.call(transport, opcionesEmail);
}
