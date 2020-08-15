const express = require('express');
const router = express.Router();
const { body, check, validationResult } = require('express-validator');
const homeController = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');

module.exports = () => {
    router.get('/', homeController.mostrarTrabajos);

    //Crear Vacantes
    router.get('/vacantes/nueva',
        authController.verificarUsuario,
        vacantesController.formularioNuevaVacante);
    router.post('/vacantes/nueva',
        authController.verificarUsuario,
        vacantesController.arregloParaValidarLasVacantes,
        vacantesController.validarVacante,
        vacantesController.agregarVacante);
    //Eliminar vacantes.
    router.delete('/vacantes/eliminar/:id',
        vacantesController.eliminarVacante
    )

    //Mostrar Vacante (singular)
    router.get('/vacantes/:url', vacantesController.mostrarVacante);
    //Recibir mensajes de candidatos
    router.post('/vacantes/:url',
        vacantesController.subirCV,
        vacantesController.contactar
    );
    //Editar vacante
    router.get('/vacantes/editar/:url',
        authController.verificarUsuario,
        vacantesController.formEditarVacante);
    router.post('/vacantes/editar/:url',
        authController.verificarUsuario,
        vacantesController.arregloParaValidarLasVacantes,
        vacantesController.validarVacante,
        vacantesController.editarVacante);

    //Crear cuentas
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    //Usamos express-validator 6. escape(): Permite sanatizar, si hay caracteres que puedan afectar el programa los reemplaza para que no hagan daño, como por ejemplo <script></script>
    router.post('/crear-cuenta',
        usuariosController.arregloParaValidarCrearCuenta,
        usuariosController.validarRegistro,
        usuariosController.crearUsuario);
    //Autenticar usuarios
    router.get("/iniciar-sesion", usuariosController.formIniciarSesion);
    router.post("/iniciar-sesion", authController.autenticarUsuario);
    //Cerrar sesion
    router.get('/cerrar-sesion',
        authController.verificarUsuario,
        authController.cerrarSesion
    );
    //Resetear password
    router.get('/restablecer-password', authController.formRestablecerPassword);
    router.post('/restablecer-password', authController.enviarToken);
    //Resetear password (Almacenar en la BD).
    router.get('/restablecer-password/:token', authController.reestablecerPassword);
    router.post('/restablecer-password/:token', authController.guardarPassword);
    //Panel de administracion
    router.get('/administracion',
        authController.verificarUsuario,
        authController.mostrarPanel);

    //Editar Perfil
    router.get('/editar-perfil',
        authController.verificarUsuario,
        usuariosController.formEditarPerfil
    );
    router.post('/editar-perfil',
        authController.verificarUsuario,
        usuariosController.subirImagen,
        usuariosController.editarPerfil
    );
    //Muestra los candidatos por vacante.
    router.get('/candidatos/:id',
        authController.verificarUsuario,
        vacantesController.mostrarCandidatos
    );
    //Buscador de vacantes.
    router.post('/buscador', vacantesController.buscarVacantes);


    return router; //Obligatoriamente se debe colocar el return, sino no funciona.
}