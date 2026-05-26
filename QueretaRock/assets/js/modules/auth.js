const loginForm = document.querySelector('#loginForm');
const registerForm = document.querySelector('#registerForm');

/* ================= SAFE USER ================= */

function getUsuario() {
    const raw = localStorage.getItem("usuario");

    if (!raw || raw === "undefined" || raw === "null") {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch (e) {
        localStorage.removeItem("usuario");
        return null;
    }
}

/* ============== LOGIN ============== */

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.querySelector('#loginEmail').value;
        const password = document.querySelector('#loginPassword').value;

        try {
            const response = await fetch(
                '/Proyecto_Final/QueretaRock/backend/auth/login.php',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                }
            );

            const data = await response.json();

            console.log(data);

            if (data.success) {
                localStorage.setItem(
                    "usuario",
                    JSON.stringify(data.usuario)
                );

                window.location.href =
                    '/Proyecto_Final/QueretaRock/index.html';
            } else {
                alert(data.message);
            }

        } catch (error) {
            console.error("Error login:", error);
            alert("Error de conexión con el servidor");
        }
    });
}

/* ============== REGISTER ============== */

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.querySelector('#registerUsername').value;
        const email = document.querySelector('#registerEmail').value;
        const password = document.querySelector('#registerPassword').value;

        try {
            const response = await fetch(
                '/Proyecto_Final/QueretaRock/backend/auth/register.php',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, email, password })
                }
            );

            const data = await response.json();

            if (data.success) {
                alert('Registro exitoso');
            } else {
                alert(data.message);
            }

        } catch (error) {
            console.error("Error register:", error);
            alert("Error de conexión con el servidor");
        }
    });
}

/* ============== AUTH UI ============== */

document.addEventListener("DOMContentLoaded", () => {
    const authContainer = document.getElementById("authContainer");
    if (!authContainer) return;

    const usuario = getUsuario();

    if (usuario) {
        authContainer.innerHTML = `
            <div class="profile-box">
                <h3>${usuario.nombre || ""}</h3>
                <p>${usuario.email || ""}</p>
                <button onclick="logout()">Cerrar sesión</button>
            </div>
        `;
    }
});

/* ============== LOGOUT ============== */

function logout() {
    localStorage.removeItem("usuario");
    window.location.href = "/Proyecto_Final/QueretaRock/index.html";
}

window.logout = logout;