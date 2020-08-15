const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const slug = require("slug"); //Nos permite modificar las urls. Ejemplo: React Developer pasa a react-developer 
const shortid = require("shortid");


const vacantesSchema = new mongoose.Schema({
    titulo: {
        type: String,
        require: 'El nombre de la vacante es obligatorio',
        trim: true
    },
    empresa: {
        type: String,
        trim: true
    },
    ubicacion: {
        type: String,
        trim: true,
        required: 'La ubicacion es obligatorio'
    },
    salario: {
        type: String,
        default: 0,
        trim: true
    },
    contrato: {
        type: String
    },
    descripcion: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        lowercase: true
    },
    // skills: {
    //     type: [String],
    //     candidatos: [{
    //         nombre: String,
    //         email: String,
    //         cv: String
    //     }]
    // }
    skills: [String],
    candidatos: [{
        nombre: String,
        email: String,
        cv: String
    }],
    autor: {
        type: mongoose.Schema.ObjectId,
        ref: 'Usuarios',
        required: 'El autor es obligatorio'
    }
});
//save es un midleware. Un midleware se produce antes de una accion. En este caso ANTES DE GUARDAR.
vacantesSchema.pre('save', function(next) {
    //Crear url
    const url = slug(this.titulo);
    this.url = `${url}-${shortid.generate()}`;
    next(); //Siguiente Middleware.
});
//Crear un indice. Utiliza los indices cuando quieras hacer una busqueda que pueda tener mas de un resultado tipo contactos cuando buscas un nombre, ejemplo carlos, pero tienes como 4 carlos guardados, entonces salen los 4.
vacantesSchema.index({ titulo: 'text' });

module.exports = mongoose.model("Vacante", vacantesSchema);