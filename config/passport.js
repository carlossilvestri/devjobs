const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async(email, password, done) => {
    const usuario = await Usuarios.findOne({ email });
    console.log(usuario);
    if (!usuario) return done(null, false, { message: 'Usuario no existente.' });
    //El usuario existe, vamos a verificarlo.
    const verificarPassword = usuario.compararPassword(password);
    if (!verificarPassword) {
        return done(null, false, { message: 'Password incorrecto.' });
    }
    //El usuario existe y el password es correcto.
    return done(null, usuario);

}));
passport.serializeUser((usuario, done) => done(null, usuario._id));
passport.deserializeUser(async(id, done) => {
    const usuario = await Usuarios.findById(id).exec();
    return done(null, usuario);
});

module.exports = passport;