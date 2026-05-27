/* ================= AUTH MODULE ================= */

const BASE_URL = '/Proyecto_Final/QueretaRock/';

const loginForm    = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Si no hay ningún formulario de auth en la página, no hace nada
if (!loginForm && !registerForm) {
    // Módulo cargado pero sin formularios — salida silenciosa
}

/* ================= HELPER ================= */

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

/* ── Si ya hay sesión activa y estamos en login/register, redirigir ── */
if ((loginForm || registerForm) && getUsuario()) {
    window.location.href = BASE_URL + 'index.html';
}

/* ================= LOGIN ================= */

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email    = document.getElementById('loginEmail')?.value.trim()  || '';
        const password = document.getElementById('loginPassword')?.value       || '';

        if (!email || !password) {
            alert('Por favor llena todos los campos');
            return;
        }

        const btn = loginForm.querySelector('.login-btn');
        if (btn) { btn.disabled = true; btn.textContent = 'Iniciando...'; }

        try {
            const response = await fetch(BASE_URL + 'backend/auth/login.php', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ email, password })
            });

            if (!response.ok) throw new Error('HTTP ' + response.status);
            const data = await response.json();

            if (data.success) {
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                window.location.href = BASE_URL + 'index.html';
            } else {
                alert(data.message || 'Correo o contraseña incorrectos');
            }
        } catch (error) {
            console.error('Error login:', error);
            alert('Error de conexión con el servidor. Verifica que esté activo.');
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = 'Iniciar sesión'; }
        }
    });
}

/* ================= REGISTER ================= */

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('registerUsername')?.value.trim() || '';
        const email    = document.getElementById('registerEmail')?.value.trim()    || '';
        const password = document.getElementById('registerPassword')?.value         || '';

        if (!username || !email || !password) {
            alert('Por favor llena todos los campos');
            return;
        }

        if (password.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        const btn = registerForm.querySelector('.login-btn');
        if (btn) { btn.disabled = true; btn.textContent = 'Registrando...'; }

        try {
            const response = await fetch(BASE_URL + 'backend/auth/register.php', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ username, email, password })
            });

            if (!response.ok) throw new Error('HTTP ' + response.status);
            const data = await response.json();

            if (data.success) {
                alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
                window.location.href = 'login.html';
            } else {
                alert(data.message || 'Error al registrar');
            }
        } catch (error) {
            console.error('Error register:', error);
            alert('Error de conexión con el servidor. Verifica que esté activo.');
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = 'Crear cuenta'; }
        }
    });
}

/* ================= TOGGLE CONTRASEÑA ================= */

document.querySelectorAll('.password-group .ri-eye-line, .password-group .ri-eye-off-line')
    .forEach(icon => {
        icon.addEventListener('click', () => {
            const input = icon.previousElementSibling;
            if (!input) return;
            const isPass = input.type === 'password';
            input.type = isPass ? 'text' : 'password';
            icon.classList.toggle('ri-eye-line',     !isPass);
            icon.classList.toggle('ri-eye-off-line',  isPass);
        });
    });
