import './modules/cart.js';
import './modules/menu.js';
import './modules/products.js';
import './modules/product-detail.js';
import './modules/auth.js';

/* ================= BASE URL ================= */

const BASE_URL =
'/Proyecto_Final/QueretaRock/';

/* ================= NAVBAR SCROLL ================= */

const navbar =
document.querySelector('.header');

if (navbar) {

    window.addEventListener(
        'scroll',
        () => {

            if (window.scrollY > 50) {

                navbar.classList.add(
                    'scrolled'
                );

            } else {

                navbar.classList.remove(
                    'scrolled'
                );
            }
        }
    );
}

/* ================= LOADER ================= */

window.addEventListener(
    'load',
    () => {

        const loader =
        document.querySelector('.loader');

        if (loader) {

            loader.classList.add(
                'fade-out'
            );
        }
    }
);

/* ================= SAFE USER ================= */

function getUsuario() {

    const raw =
    localStorage.getItem('usuario');

    if (
        !raw ||
        raw === 'undefined' ||
        raw === 'null'
    ) {

        return null;
    }

    try {

        return JSON.parse(raw);

    } catch (error) {

        console.log(
            'Usuario corrupto'
        );

        localStorage.removeItem(
            'usuario'
        );

        return null;
    }
}

const usuario =
getUsuario();

/* ================= USER LINK ================= */

document.addEventListener(
    'DOMContentLoaded',
    () => {

        const userLink =
        document.getElementById(
            'userLink'
        );

        if (!userLink) return;

        if (usuario) {

            userLink.href =
            BASE_URL +
            'pages/user.html';

        } else {

            userLink.href =
            BASE_URL +
            'pages/login.html';
        }
    }
);

/* ================= USER PAGE ================= */

document.addEventListener(
    'DOMContentLoaded',
    () => {

        if (!usuario) return;

        const nombre =
        document.getElementById(
            'nombre'
        );

        const apellido =
        document.getElementById(
            'apellido'
        );

        const correo =
        document.getElementById(
            'correo'
        );

        if (nombre) {

            nombre.value =
            usuario.nombre || '';
        }

        if (apellido) {

            apellido.value =
            usuario.apellido || '';
        }

        if (correo) {

            correo.value =
            usuario.email || '';
        }
    }
);

/* ================= LOGOUT ================= */

function cerrarSesion() {

    localStorage.removeItem(
        'usuario'
    );

    window.location.href =
    BASE_URL +
    'pages/login.html';
}

window.cerrarSesion =
cerrarSesion;

/* ================= CLEAN INVALID STORAGE ================= */

const invalidUser =
localStorage.getItem(
    'usuario'
);

if (
    invalidUser === 'undefined' ||
    invalidUser === 'null'
) {

    localStorage.removeItem(
        'usuario'
    );
}