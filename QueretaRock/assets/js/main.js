import './modules/cart.js';
import './modules/menu.js';
import './modules/products.js';
import './modules/product-detail.js';
import './modules/auth.js';

/* ================= BASE URL ================= */

const BASE_URL = '/Proyecto_Final/QueretaRock/';

/* ================= NAVBAR SCROLL ================= */

const navbar = document.querySelector('.header');

if (navbar) {
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
}

/* ================= LOADER ================= */

window.addEventListener('load', () => {
    const loader = document.querySelector('.loader');
    if (loader) loader.classList.add('fade-out');
});

/* ================= SAFE USER ================= */

function getUsuario() {
    const raw = localStorage.getItem('usuario');
    if (!raw || raw === 'undefined' || raw === 'null') return null;
    try {
        return JSON.parse(raw);
    } catch {
        localStorage.removeItem('usuario');
        return null;
    }
}

const usuario = getUsuario();

/* ================= USER LINK ================= */

document.addEventListener('DOMContentLoaded', () => {
    const userLink = document.getElementById('userLink');
    if (!userLink) return;

    userLink.href = usuario
        ? BASE_URL + 'pages/user.html'
        : BASE_URL + 'pages/login.html';
});

/* ================= USER PAGE — populate form ================= */

document.addEventListener('DOMContentLoaded', () => {
    const nombreEl   = document.getElementById('nombre');
    const apellidoEl = document.getElementById('apellido');
    const correoEl   = document.getElementById('correo');

    /* Si estamos en user.html y no hay sesión → redirigir */
    if (
        window.location.pathname.includes('user.html') &&
        !usuario
    ) {
        window.location.href = BASE_URL + 'pages/login.html';
        return;
    }

    if (!usuario) return;

    if (nombreEl)   nombreEl.value   = usuario.nombre   || '';
    if (apellidoEl) apellidoEl.value = usuario.apellido || '';
    if (correoEl)   correoEl.value   = usuario.email    || '';
});

/* ================= LOGOUT ================= */

function cerrarSesion() {
    localStorage.removeItem('usuario');
    window.location.href = BASE_URL + 'pages/login.html';
}

window.cerrarSesion = cerrarSesion;

/* ================= CLEAN INVALID STORAGE ================= */

const _raw = localStorage.getItem('usuario');
if (_raw === 'undefined' || _raw === 'null') {
    localStorage.removeItem('usuario');
}
