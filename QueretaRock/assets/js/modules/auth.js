const BASE_URL = '/Proyecto_Final/QueretaRock/';

const loginForm    = document.querySelector('#loginForm');
const registerForm = document.querySelector('#registerForm');

/* ================= SAFE USER ================= */

function getUsuario() {
    const raw = localStorage.getItem('usuario');
    if (!raw || raw === 'undefined' || raw === 'null') return null;
    try {
        return JSON.parse(raw);
    } catch (e) {
        localStorage.removeItem('usuario');
        return null;
    }
}

/* ============== LOGIN ============== */

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email    = document.querySelector('#loginEmail').value.trim();
        const password = document.querySelector('#loginPassword').value;

        try {
            const response = await fetch(
                BASE_URL + 'backend/auth/login.php',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                }
            );

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                window.location.href = BASE_URL + 'index.html';
            } else {
                alert(data.message || 'Error al iniciar sesión');
            }

        } catch (error) {
            console.error('Error login:', error);
            alert('Error de conexión con el servidor');
        }
    });
}

/* ============== REGISTER ============== */

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.querySelector('#registerUsername').value.trim();
        const email    = document.querySelector('#registerEmail').value.trim();
        const password = document.querySelector('#registerPassword').value;

        if (!username || !email || !password) {
            alert('Por favor llena todos los campos');
            return;
        }

        try {
            const response = await fetch(
                BASE_URL + 'backend/auth/register.php',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                }
            );

            const data = await response.json();

            if (data.success) {
                alert('Registro exitoso. Ahora puedes iniciar sesión.');
                window.location.href = BASE_URL + 'pages/login.html';
            } else {
                alert(data.message || 'Error al registrar');
            }

        } catch (error) {
            console.error('Error register:', error);
            alert('Error de conexión con el servidor');
        }
    });
}

/* ============== PASSWORD TOGGLE ============== */

document.querySelectorAll('.password-group .ri-eye-line').forEach(icon => {
    icon.addEventListener('click', () => {
        const input = icon.previousElementSibling;
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('ri-eye-line', 'ri-eye-off-line');
        } else {
            input.type = 'password';
            icon.classList.replace('ri-eye-off-line', 'ri-eye-line');
        }
    });
});
