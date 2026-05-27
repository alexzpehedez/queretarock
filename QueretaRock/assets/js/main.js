/* ================= IMPORTS ================= */
// cart y menu se cargan en todas las páginas
import './modules/cart.js';
import './modules/menu.js';

// products.js solo actúa si hay un grid de productos en la página
import './modules/products.js';

// product-detail.js solo actúa si estamos en product.html (hay #productName)
import './modules/product-detail.js';

// auth.js solo actúa si hay formulario de login o registro
import './modules/auth.js';

/* ================= BASE URL ================= */

const BASE_URL = '/Proyecto_Final/QueretaRock/';

/* ================= NAVBAR SCROLL ================= */

const header = document.querySelector('.header');
if (header) {
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
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
        ? (window.location.pathname.includes('/pages/')
            ? 'user.html'
            : BASE_URL + 'pages/user.html')
        : (window.location.pathname.includes('/pages/')
            ? 'login.html'
            : BASE_URL + 'pages/login.html');
});

/* ================= USER PAGE — pre-fill form ================= */

document.addEventListener('DOMContentLoaded', () => {
    const isUserPage = window.location.pathname.includes('user.html');

    // Redirige si no hay sesión y estamos en la página de perfil
    if (isUserPage && !usuario) {
        window.location.href = window.location.pathname.includes('/pages/')
            ? 'login.html'
            : BASE_URL + 'pages/login.html';
        return;
    }

    if (!usuario) return;

    // Pre-fill básico desde localStorage (user.js lo sobreescribe con datos de BD)
    const nombreEl   = document.getElementById('nombre');
    const apellidoEl = document.getElementById('apellido');
    const correoEl   = document.getElementById('correo');

    if (nombreEl   && !nombreEl.value)   nombreEl.value   = usuario.nombre   || '';
    if (apellidoEl && !apellidoEl.value) apellidoEl.value = usuario.apellido || '';
    if (correoEl   && !correoEl.value)   correoEl.value   = usuario.email    || '';
});

/* ================= LOGOUT ================= */

function cerrarSesion() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('cart');
    const loginPath = window.location.pathname.includes('/pages/')
        ? 'login.html'
        : BASE_URL + 'pages/login.html';
    window.location.href = loginPath;
}

window.cerrarSesion = cerrarSesion;

/* ================= CLEAN INVALID STORAGE ================= */

const _rawUsuario = localStorage.getItem('usuario');
if (_rawUsuario === 'undefined' || _rawUsuario === 'null') {
    localStorage.removeItem('usuario');
}
