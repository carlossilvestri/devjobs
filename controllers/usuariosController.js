const mongoose = require('mongoose');
const { body, check, validationResult } = require('express-validator');
const Usuarios = mongoose.model('Usuarios'); //Otra forma con require('../models/Usuarios');
const multer = require('multer');
const shortid = require('shortid');
//Inicializar variables.
let nombreUsuario = '',
    emailUsuario = '',
    passwordUsuario = '',
    booleanEditarUsuario = false;
var arregloParaValidarPerfil2 = [];

//Objeto con las opciones de Multer
const configuracionMulter = {
    limits: { fileSize: 100000 }, //100kb
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname + '../../public/uploads/perfiles');
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        },
    }),
    fileFilter(req, file, cb) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            //  El callback (cb) se ejcuta como true o false. True cuando la imagen se acepta.
            console.log("Estamos en paso la validacion");
            cb(null, true);
        } else {
            console.log("Estamos en NO paso la validacion");
            cb(new Error('Formato no válido.'), false);
        }
    }
}
const upload = multer(configuracionMulter).single('imagen');
//exports.upload = upload; //Necesariamente necesito enviarle esto al routes, sino no funciona el req.file
//Middleware 
exports.subirImagen = (req, res, next) => {
    //Si hay errores con multer,
    upload(req, res, function(error) {
        console.log('Por aqui en subirImagenupload');
        if (error) {
            try {
                console.log('Try de subirImagen');
                //Si es un error de multer
                if (error instanceof multer.MulterError) {
                    console.log('error instanceof multer.MulterError de subirImagen');
                    if (error.code === 'LIMIT_FILE_SIZE') {
                        req.flash('error', 'El archivo es muy grande. Máximo 100kb.');
                    } else {
                        //Mostrar la notificacion de error.
                        req.flash('error', error.message);
                    }
                } else {
                    //Error
                    console.log(error.message);
                    req.flash('error', error.message);
                }
                //Evitar que vaya al siguiente middleware.
                booleanEditarUsuario = false;
            } catch (error2) {
                console.log('Catch de subirImagen');
            }
        } else {
            booleanEditarUsuario = true;
        }
    });
    next(); //Importante sino no me deja usar siguiente middleware.
}

exports.formCrearCuenta = (req, res) => {
    res.render("crear-cuenta", {
        nombrePagina: 'Crea tu Cuenta en devJobs',
        tagline: 'Comienza a publicar tus vacantes gratis solo debes crear una cuenta'
    })
}
exports.arregloParaValidarCrearCuenta = [
    // El nombre no puede estar vacio.
    check('nombre').not().isEmpty().trim().withMessage('El nombre es Obligatorio').escape(),
    //Email no puede estar vacio, que  sea un email valido con @.
    check('email').not().isEmpty().trim().withMessage('El email es obligatorio').isEmail().withMessage('Ingresa un email válido').escape(),
    // password must be at least 5 chars long
    check('password').not().isEmpty().withMessage('La contraseña es obligatoria').isLength({ min: 5 }).withMessage('La contraseña debe ser mayor de 5 carácteres').matches(/\d/).withMessage('La contraseña debe contener almenos un número').escape(),
    check("confirmar").not().isEmpty().withMessage('Repetir la contraseña es obligatorio').escape().custom((value, { req, loc, path }) => {
        if (value !== req.body.password) {
            // Si false se ejecuta el withMessage
            return false; //throw new Error("Las contraseñas no coinciden");
        } else {
            // Si true no se ejecuta el withMessage
            return true;
        }
    }).withMessage('Las contraseñas no coinciden')
]

exports.validarRegistro = (req, res, next) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    //Si hay errores.
    if (errors.errors.length > 0) {
        req.flash('error', errors.errors.map(error => error.msg));

        res.render("crear-cuenta", {
            nombrePagina: 'Crea tu Cuenta en devJobs',
            tagline: 'Comienza a publicar tus vacantes gratis solo debes crear una cuenta',
            mensajes: req.flash()
        });
        return; //Permite que ya no se este ejecutando
    }
    //No hay errores. Toda la validacion es correcta.
    next();
}

exports.crearUsuario = async(req, res, next) => {
        //Crear el usuario
        const usuario = new Usuarios(req.body);
        try {
            await usuario.save();
            res.redirect('/iniciar-sesion');
        } catch (error) {
            req.flash('error', error);
            res.redirect('/crear-cuenta');
        }
    }
    //Formularios para iniciar sesion
exports.formIniciarSesion = (req, res) => {
        res.render('iniciar-sesion', {
            nombrePagina: 'Iniciar Sesión devJobs'
        })
    }
    //Form editar perfil
exports.formEditarPerfil = (req, res) => {
        res.render('editar-perfil', {
            nombrePagina: 'Edita tu perfil en devJobs',
            usuario: req.user,
            cerrarSesion: true,
            nombre: req.user.nombre,
            imagen: req.user.imagen
        })
    }
    //Guardar cambios editar perfil
exports.editarPerfil = async(req, res, next) => {
    //Despues de esta linea de codigo hay acceso a req.body. Antes no se tiene acceso, ni idea por que.
    const usuario = await Usuarios.findById(req.user._id);
    //**************Reglas y Sanityze****************//
    const rules = [
        /*El nombre y el email son obligatorios. */
        check('nombre').not().isEmpty().trim().withMessage('El nombre es Obligatorio').escape(),
        check('email').not().isEmpty().trim().withMessage('El email es obligatorio').isEmail().withMessage('Ingresa un email válido').escape(),
    ];
    //***********Ejecutar Validaciones Express***********/
    await Promise.all(rules.map(validation => validation.run(req)));
    // Meter en "errores" los errores de Express-Validator
    const errores = validationResult(req);

    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    if (req.body.password) {
        usuario.password = req.body.password
    }
    if (req.file) {
        usuario.imagen = req.file.filename;
    }
    //Si hay errores, guardarlos en flash messages.
    if (errores.errors.length > 0) {
        booleanEditarUsuario = false;
        req.flash('error', errores.errors.map(error => error.msg));
    } else {
        //No hay errores
        try {
            await usuario.save();
            //Mostrar la notificacion de todo correcto.
            if (booleanEditarUsuario) {
                req.flash('correcto', 'Cambios guardados correctamente.');
            }
        } catch (error) {
            //Mostrar la notificacion de error.
            console.log('catch error aqui ');
        }
    }
    console.log('Pasa por aqui en editarPerfil');
    //Redirigir a administracion
    res.redirect('/administracion');
}