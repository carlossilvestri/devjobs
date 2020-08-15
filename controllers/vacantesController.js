const mongoose = require('mongoose');
const { body, check, validationResult } = require('express-validator');
const Vacante = mongoose.model('Vacante'); //Otra forma con require('../models/Vacante');
const multer = require('multer');
const shortid = require('shortid');
const crypto = require("crypto");

let booleanContactarReclutador = false;

exports.formularioNuevaVacante = (req, res) => {
        res.render('nueva-vacante', {
            nombrePagina: 'Nueva Vacante',
            tagline: 'Llena el formulario y publica tu vacante',
            cerrarSesion: true,
            nombre: req.user.nombre,
            imagen: req.user.imagen,
        });
    }
    //Agrega las vacantes a la BD.
exports.agregarVacante = async(req, res) => {
    const vacante = new Vacante(req.body);

    //Usuario autor de la vacante.
    vacante.autor = req.user._id;

    //Crear arreglo de habilidades.
    vacante.skills = req.body.skills.split(',');
    //Almacenar en la BD
    const nuevaVacante = await vacante.save();
    //Redireccionar al usuario.
    res.redirect(`/vacantes/${nuevaVacante.url}`);
}

//Muestra una vacante
exports.mostrarVacante = async(req, res, next) => {
        const vacante = await Vacante.findOne({ url: req.params.url }).populate('autor'); //req.params.url Permite acceder
        //Si no hay resultados. Entonces pasar al siguiente middleware.
        if (!vacante) return next();
        res.render('vacante', {
            vacante,
            nombrePagina: vacante.titulo,
            barra: true
        })

    }
    ///Editar vacante
exports.formEditarVacante = async(req, res, next) => {
        const vacante = await Vacante.findOne({ url: req.params.url }); //req.params.url Permite acceder
        //Si no hay resultados. Entonces pasar al siguiente middleware.
        if (!vacante) return next();

        res.render('editar-vacante', {
            vacante,
            nombrePagina: `Editar - ${vacante.titulo}`,
            cerrarSesion: true,
            nombre: req.user.nombre,
            imagen: req.user.imagen,
        });
    }
    //Editar
exports.editarVacante = async(req, res) => {
        //Obtener los datos con req.body;
        const vacanteActualizada = req.body;
        //Quitarle la compa al skills con split(',')
        vacanteActualizada.skills = req.body.skills.split(',');
        //Editar en la BD
        /*
        findOneAndUpdate:
        Params:
         1: Lo que vas a buscar.
         2: Con lo que lo vas a actualizar.
         3. Opciones de mongoose. Son muchas, viene como objeto.
        */
        const vacante = await Vacante.findOneAndUpdate({ url: req.params.url }, vacanteActualizada, {
            new: true,
            runValidators: true
        });
        //Redireccionar al usuario.
        res.redirect(`/vacantes/${vacante.url}`);
    }
    //Validar y sanitizar los campos de las nuevas vacantes.
exports.arregloParaValidarLasVacantes = [
    // El nombre no puede estar vacio.
    check('titulo').not().isEmpty().trim().withMessage('El título es Obligatorio').escape(),
    // password must be at least 5 chars long
    check('empresa').not().isEmpty().trim().withMessage('La empresa es obligatoria').escape(),
    // password must be at least 5 chars long
    // check('ubicacion').not().isEmpty().trim().withMessage('La ubicación es obligatoria').escape(),
    check('salario').not().isEmpty().trim().withMessage('El salario es obligatorio').escape(),
    check('contrato').not().isEmpty().trim().withMessage('El contrato es Obligatorio').escape(),
    check('skills').not().isEmpty().trim().withMessage('Los skills son obligatorios').escape(),
];
exports.validarVacante = (req, res, next) => {
    const errors = validationResult(req);
    //Si hay errores.
    if (errors.errors.length > 0) {
        req.flash('error', errors.errors.map(error => error.msg));

        res.render("nueva-vacante", {
            nombrePagina: 'Nueva Vacante',
            tagline: 'Llena el formulario y publica tu vacante',
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash()
        });
        return; //Permite que ya no se este ejecutando
    }
    //No hay errores. Toda la validacion es correcta.
    next();
}
exports.eliminarVacante = async(req, res) => {
        const { id } = req.params;
        const vacante = await Vacante.findById(id);
        if (verificarAutor(vacante, req.user)) {
            //Todo bien, eliminar.
            vacante.remove();
            res.status(200).send('Vacante eliminada correctamente.');
        } else {
            //No permitido.
            res.status(403).send('Error.');
        }

        res.status(200).send('Vacante Eliminada Correctamente.');
    }
    /*
    verificarAutor: Permite saber si la vacante que se va a eliminar esta siendo eliminada por el mismo autor que la creo.
    Params: 1.- vacante a eliminar. 2.- usuario: Sesion actual de usuario.
    */
const verificarAutor = (vacante = {}, usuario = {}) => {
        //Si no son iguales entonce retornar false
        if (!vacante.autor.equals(usuario._id)) {
            return false;
        }
        return true;
    }
    //Objeto con las opciones de Multer
const configuracionMulter = {
    limits: { fileSize: 200000 }, //200kb
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname + '../../public/uploads/cv');
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        },
    }),
    fileFilter(req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            //  El callback (cb) se ejcuta como true o false. True cuando la imagen se acepta.
            //console.log("Estamos en paso la validacion");
            cb(null, true);
        } else {
            //console.log("Estamos en NO paso la validacion");
            cb(new Error('Formato no válido.'), false);
        }
    }
}
const upload = multer(configuracionMulter).single('cv');

//Subir archivos en pdf
exports.subirCV = (req, res, next) => {
    //Si hay errores con multer,
    upload(req, res, function(error) {
        if (error) {
            try {
                //Si es un error de multer
                if (error instanceof multer.MulterError) {
                    if (error.code === 'LIMIT_FILE_SIZE') {
                        req.flash('error', 'El archivo es muy grande. Máximo 200kb.');
                    } else {
                        //Mostrar la notificacion de error.
                        req.flash('error', error.message);
                    }
                } else {
                    //Error
                    req.flash('error', error.message);
                }
                //Evitar que vaya al siguiente middleware.
                booleanContactarReclutador = false;
            } catch (error2) {
                //console.log('Catch de subirCV');
            }
        } else {
            booleanContactarReclutador = true;
        }
    });
    next(); //Importante sino no me deja usar siguiente middleware.
}

//Almacenar
exports.contactar = async(req, res, next) => {
    //Despues de esta linea de codigo hay acceso a req.body. Antes no se tiene acceso, ni idea por que.
    const vacante = await Vacante.findOne({ url: req.params.url });
    //Si no hay vacantes.
    if (!vacante) return next();
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
    let boolErrorPDF = false;
    //Si hay archivo entonces crear el objeto
    if (req.file) {
        boolErrorPDF = false;
        //Todo bien, construir la vacante.
        const nuevoCandidato = {
            nombre: req.body.nombre,
            email: req.body.email,
            cv: req.file.filename
        }
        vacante.candidatos.push(nuevoCandidato);
    } else {
        //El archivo ingresado no es valido
        boolErrorPDF = true;
    }

    //Si hay errores, guardarlos en flash messages.
    if (errores.errors.length > 0 || boolErrorPDF) {
        //Mensajes de error de email y nombre.
        if (errores.errors.length > 0) {
            //console.log(errores.errors);
            req.flash('error', errores.errors.map(error => error.msg));
        }
        res.redirect('back'); //Recargar la pagina mostrando los mensajes de error.
        return; //Detener el middleware.
    } else {
        //No hay errores
        try {
            await vacante.save();
            //Mostrar la notificacion de todo correcto.
            if (booleanContactarReclutador) {
                req.flash('correcto', 'Se envió tu curriculum correctamente.');
            }
        } catch (error) {
            //Mostrar la notificacion de error.
            //console.log('catch error aqui ');
        }
    }
    //console.log('Pasa por aqui en contactar');
    //Redirigir a administracion
    res.redirect('/');
}
exports.mostrarCandidatos = async(req, res, next) => {
        const vacante = await Vacante.findById(req.params.id);

        if (!vacante) {
            //console.log('!vacante aqui');
            return next();
        }
        if (vacante.autor != req.user._id.toString()) {
            //console.log('vacante.autor != req.user._id.toString()');
            return next();
        }
        res.render('candidatos', {
            nombrePagina: `Candidatos Vacante - ${vacante.titulo}`,
            cerrarSesion: true,
            nombre: req.user.nombre,
            imagen: req.user.imagen,
            candidatos: vacante.candidatos

        });

    }
    //Buscador de vacantes
exports.buscarVacantes = async(req, res) => {
    const vacantes = await Vacante.find({
        $text: {
            $search: req.body.q
        }
    });
    //Mostrar las vacantes.
    res.render('home', {
        nombrePagina: `Resultados para la búsqueda: ${req.body.q}`,
        barra: true,
        vacantes
    })
}