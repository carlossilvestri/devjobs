import axios from 'axios';
import Swal from 'sweetalert2';

document.addEventListener("DOMContentLoaded", () => {
    const skills = document.querySelector(".lista-conocimientos");
    //Limpiar las alertas
    let alertas = document.querySelector(".alertas");
    if (alertas) {
        limpiarAlertas();
    }
    if (skills) {
        skills.addEventListener("click", agregarSkills);
        //Una vez que estamos en editar, llamar la funcion
        skillsSeleccionados();
    }
    const vacantesListado = document.querySelector('.panel-administracion');
    if (vacantesListado) {
        vacantesListado.addEventListener('click', accionesListado);
    }
});

const skills = new Set();
const agregarSkills = e => {
    if (e.target.tagName === "LI") {
        if (e.target.classList.contains('activo')) {
            //Quitarlo del set y quitar la clase
            skills.delete(e.target.textContent);
            e.target.classList.remove('activo');
        } else {
            //Agregarlo al set y agregar la clase
            skills.add(e.target.textContent);
            e.target.classList.add('activo');
        }
    }
    const skillsArray = [...skills];
    document.querySelector("#skills").value = skillsArray;
}
const skillsSeleccionados = () => {
    const selecciondas = Array.from(document.querySelectorAll('.lista-conocimientos .activo'));
    // console.log(selecciondas);

    selecciondas.forEach(seleccionada => {
        skills.add(seleccionada.textContent);
    });

    //Inyectarlo en el hidden
    const skillsArray = [...skills];
    document.querySelector("#skills").value = skillsArray;
}

const limpiarAlertas = () => {
        const alertas = document.querySelector(".alertas");
        if (alertas.children.length > 0) {
            //Se ejecuta cada 2,5 seg hasta que le pongas clearInterval
            const interval = setInterval(() => {
                if (alertas.children.length > 0) {
                    alertas.removeChild(alertas.children[0]);
                } else if (alertas.children.length === 0) {
                    alertas.parentElement.removeChild(alertas);
                    clearInterval(interval);
                }
            }, 2500);
        }
    }
    //Eliminar vacantes
const accionesListado = e => {
    e.preventDefault();
    if (e.target.dataset.eliminar) {
        //Eliminar por axios.
        Swal.fire({
                title: '¿Estás seguro que desea eliminarlo?',
                text: "Una vez eliminado, no se podrá recuperar.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar.',
                cancelButtonText: "No, cancelar."
            }).then((result) => {
                if (result.value) {

                    //Eliminar por axios.
                    const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;
                    //Axios para eliminar el registro
                    axios.delete(url, { params: { url } })
                        .then(function(respuesta) {
                            if (respuesta.status === 200) {
                                Swal.fire(
                                    'Eliminado',
                                    respuesta.data,
                                    'success'
                                );
                                //TODO eliminar del DOM
                                //Padre.removeChild(hijo)
                                e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement);
                            }
                        })
                        .catch(() => {
                            Swal.fire({
                                type: 'error',
                                title: 'Hubo un error.',
                                text: 'No se pudo eliminar.'
                            })
                        });

                    return;
                }
            })
            //Si el click se presenta en un enlace (a). Entonces dirige al usuario a ese enlace.
    } else if (e.target.tagName === 'A') {
        window.location.href = e.target.href;
    }
}