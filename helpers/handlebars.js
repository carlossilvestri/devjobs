module.exports = {
    seleccionarSkills: (seleccionadas = [], opciones) => {
        //console.log(seleccionadas);
        const skills = ['HTML5', 'CSS3', 'CSSGrid', 'Flexbox', 'JavaScript', 'jQuery', 'Node', 'Angular', 'VueJS', 'ReactJS', 'React Hooks', 'Redux', 'Apollo', 'GraphQL', 'TypeScript', 'PHP', 'Laravel', 'Symfony', 'Python', 'Django', 'ORM', 'Sequelize', 'Mongoose', 'SQL', 'MVC', 'SASS', 'WordPress'];

        let html = '';
        //<li ${seleccionadas.includes(skill)}>${skill}</li> El li tiene el valor del arreglo que me passate en 
        skills.forEach(skill => {
            html += `
                <li ${seleccionadas.includes(skill) ? 'class="activo"' : ''  }>${skill}</li>
            `;
        });
        return opciones.fn().html = html;
    },
    /*
    Params:
    seleccionado es el que viene de la BD. (El contrato, vacante.contrato).
    opciones: Es un obj que tiene todo helper de handlebars. Con el podemos acceder al html que esta encerrado en el helper. {{#tipoContrato vacante.contrato }} HTML {{/tipoContrato}}
    y se accede con opciones.fn() . Tambien se puede acceder a otras opciones, son varias.
    */
    tipoContrato: (seleccionado, opciones) => {
        //new RegExp(`value="${seleccionado}"`), `$& selected="selected"`
        // Agregar al 1er string (`value="${seleccionado}"`) el 2do string (selected="selected).
        return opciones.fn(this).replace(
            new RegExp(`value="${seleccionado}"`), `$& selected="selected"`
        )
    },
    mostrarAlertas: (errores = {}, alertas) => {
        const categoria = Object.keys(errores);
        if (errores[categoria] == "undefined") {

        } else {
            //console.log(errores[categoria]);
        }
        //console.log(errores[categoria]);
        let html = '';
        if (categoria.length) {
            errores[categoria].forEach(error => {
                html += `
                <div class="${categoria} alerta">
                ${error}
                </div> 
                `;
            });
        }
        return alertas.fn().html = html;
    }
}