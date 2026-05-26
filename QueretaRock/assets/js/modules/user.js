const BASE_URL = 'http://localhost/Proyecto_Final/queretarock/';

function getUsuario() {
    const raw = localStorage.getItem('usuario');
    if (!raw || raw === 'undefined' || raw === 'null') return null;
    try { return JSON.parse(raw); } catch { return null; }
}

const usuario = getUsuario();

/* ── Redirige si no hay sesión ── */
if (!usuario) {
    window.location.href = BASE_URL + 'pages/login.html';
}

const profileForm    = document.getElementById('profileForm');
const profileLoading = document.getElementById('profileLoading');
const memberSince    = document.getElementById('memberSince');
const saveMsg        = document.getElementById('saveMsg');

/* ── Carga datos desde BD ── */
async function loadUserProfile() {
    try {
        const res  = await fetch(BASE_URL + 'QueretaRock/backend/auth/getUser.php', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ id: usuario.id })
        });
        const data = await res.json();

        if (!data.success) {
            profileLoading.textContent = 'No se pudo cargar el perfil.';
            return;
        }

        const u = data.usuario;

        /* Rellena el form */
        document.getElementById('nombre').value   = u.username  || '';
        document.getElementById('apellido').value = u.apellido  || '';
        document.getElementById('correo').value   = u.email     || '';
        document.getElementById('telefono').value = u.telefono  || '';

        /* Fecha de membresía */
        if (u.created_at) {
            const fecha = new Date(u.created_at);
            memberSince.textContent = fecha.toLocaleDateString('es-MX', {
                day: 'numeric', month: 'long', year: 'numeric'
            });
        }

        /* Actualiza localStorage con datos frescos */
        localStorage.setItem('usuario', JSON.stringify({
            ...usuario,
            nombre:   u.username,
            apellido: u.apellido  || '',
            email:    u.email,
            telefono: u.telefono  || ''
        }));

        profileLoading.style.display = 'none';
        profileForm.style.display    = 'flex';

    } catch (err) {
        profileLoading.textContent = 'Error de conexión.';
        console.error(err);
    }
}

/* ── Guarda cambios ── */
profileForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre   = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const telefono = document.getElementById('telefono').value.trim();

    if (!nombre) { alert('El nombre es obligatorio'); return; }

    try {
        const res  = await fetch(BASE_URL + 'QueretaRock/backend/auth/updateUser.php', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ id: usuario.id, username: nombre, apellido, telefono })
        });
        const data = await res.json();

        if (data.success) {
            /* Actualiza localStorage */
            localStorage.setItem('usuario', JSON.stringify({
                ...usuario, nombre, apellido, telefono
            }));
            saveMsg.style.display = 'block';
            setTimeout(() => saveMsg.style.display = 'none', 3000);
        } else {
            alert(data.message || 'Error al guardar');
        }
    } catch (err) {
        alert('Error de conexión');
        console.error(err);
    }
});

loadUserProfile();
