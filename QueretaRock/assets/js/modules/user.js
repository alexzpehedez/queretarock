/* ================= USER MODULE v2 ================= */

const BASE_URL = '/Proyecto_Final/QueretaRock/';

/* ── Helper: usuario desde localStorage ── */
function getUsuario() {
    const raw = localStorage.getItem('usuario');
    if (!raw || raw === 'undefined' || raw === 'null') return null;
    try { return JSON.parse(raw); } catch { return null; }
}

const usuario = getUsuario();

/* ── Redirige si no hay sesión ── */
if (!usuario) {
    window.location.href = 'login.html';
}

/* ── Helper: fetch JSON con manejo seguro de errores ── */
async function fetchJSON(url, options = {}) {
    const res = await fetch(url, options);
    const text = await res.text();            // Lee como texto primero
    try {
        return JSON.parse(text);              // Intenta parsear JSON
    } catch {
        // Si PHP mandó HTML de error, se captura aquí
        console.error('Respuesta no-JSON de', url, ':', text.substring(0, 200));
        throw new Error('El servidor respondió con un error PHP. Revisa la consola.');
    }
}

/* ── Referencias DOM: perfil ── */
const profileForm    = document.getElementById('profileForm');
const profileLoading = document.getElementById('profileLoading');
const memberSince    = document.getElementById('memberSince');
const saveMsg        = document.getElementById('saveMsg');
const userNameDisplay = document.getElementById('userNameDisplay');

/* ── Carga perfil desde BD ── */
async function loadUserProfile() {
    if (!usuario) return;

    try {
        const data = await fetchJSON(BASE_URL + 'backend/auth/getUser.php', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ id: usuario.id })
        });

        if (!data.success) {
            showProfileError(data.message || 'No se pudo cargar el perfil.');
            return;
        }

        const u = data.usuario;

        // Rellena formulario
        setValue('nombre',   u.username  || '');
        setValue('apellido', u.apellido  || '');
        setValue('correo',   u.email     || '');
        setValue('telefono', u.telefono  || '');

        // Nombre visible en portada
        if (userNameDisplay) {
            userNameDisplay.textContent =
                [u.username, u.apellido].filter(Boolean).join(' ') || 'Usuario';
        }

        // Fecha de membresía
        if (memberSince && u.created_at) {
            memberSince.textContent = new Date(u.created_at).toLocaleDateString('es-MX', {
                day: 'numeric', month: 'long', year: 'numeric'
            });
        }

        // Actualiza localStorage
        localStorage.setItem('usuario', JSON.stringify({
            ...usuario,
            nombre:   u.username  || '',
            apellido: u.apellido  || '',
            email:    u.email     || '',
            telefono: u.telefono  || ''
        }));

        // Muestra formulario
        if (profileLoading) profileLoading.style.display = 'none';
        if (profileForm)    profileForm.style.display    = 'flex';

    } catch (err) {
        console.error(err);
        showProfileError('Error de conexión. Verifica que XAMPP/WAMP esté activo y la BD configurada.');
    }
}

function showProfileError(msg) {
    if (profileLoading) {
        profileLoading.innerHTML =
            `<span style="color:#e63946"><i class="fas fa-exclamation-triangle"></i> ${msg}</span>`;
    }
}

function setValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
}

/* ── Guarda cambios de perfil ── */
profileForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre   = document.getElementById('nombre')?.value.trim()   || '';
    const apellido = document.getElementById('apellido')?.value.trim() || '';
    const telefono = document.getElementById('telefono')?.value.trim() || '';

    if (!nombre) { alert('El nombre es obligatorio'); return; }

    const saveBtn = profileForm.querySelector('.save-btn');
    if (saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...'; }

    try {
        const data = await fetchJSON(BASE_URL + 'backend/auth/updateUser.php', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ id: usuario.id, username: nombre, apellido, telefono })
        });

        if (data.success) {
            localStorage.setItem('usuario', JSON.stringify({ ...usuario, nombre, apellido, telefono }));
            if (userNameDisplay) userNameDisplay.textContent = [nombre, apellido].filter(Boolean).join(' ');
            if (saveMsg) {
                saveMsg.style.display = 'flex';
                setTimeout(() => saveMsg.style.display = 'none', 3000);
            }
        } else {
            alert(data.message || 'Error al guardar');
        }
    } catch (err) {
        alert('Error de conexión con el servidor');
        console.error(err);
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Guardar cambios';
        }
    }
});

/* ================= HISTORIAL DE COMPRAS ================= */

const ordersSection  = document.getElementById('ordersSection');
const ordersLoading  = document.getElementById('ordersLoading');
const ordersList     = document.getElementById('ordersList');
const ordersEmpty    = document.getElementById('ordersEmpty');

const STATUS_LABELS = {
    pending:   { text: 'Pendiente',   color: '#f59e0b' },
    paid:      { text: 'Pagado',      color: '#10b981' },
    shipped:   { text: 'Enviado',     color: '#3b82f6' },
    delivered: { text: 'Entregado',   color: '#6366f1' },
    cancelled: { text: 'Cancelado',   color: '#ef4444' }
};

async function loadOrders() {
    if (!usuario || !ordersList) return;

    try {
        const data = await fetchJSON(BASE_URL + 'backend/orders/getOrders.php', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ usuario_id: usuario.id })
        });

        if (ordersLoading) ordersLoading.style.display = 'none';

        if (!data.success || !data.orders || data.orders.length === 0) {
            if (ordersEmpty) ordersEmpty.style.display = 'flex';
            return;
        }

        renderOrders(data.orders);

    } catch (err) {
        console.error('Error cargando órdenes:', err);
        if (ordersLoading) {
            ordersLoading.innerHTML =
                '<span style="color:#e63946">No se pudo cargar el historial de compras.</span>';
        }
    }
}

function renderOrders(orders) {
    if (!ordersList) return;
    ordersList.innerHTML = '';

    orders.forEach(order => {
        const status   = STATUS_LABELS[order.status] || STATUS_LABELS.paid;
        const fecha    = new Date(order.created_at).toLocaleDateString('es-MX', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        const itemsHTML = order.items.map(item => {
            const img = item.product_image
                ? (item.product_image.startsWith('http')
                    ? item.product_image
                    : BASE_URL + item.product_image)
                : '';
            return `
            <div class="order-item">
                ${img ? `<img src="${img}" alt="${item.product_name}" onerror="this.style.display='none'">` : ''}
                <div class="order-item-info">
                    <span class="order-item-name">${item.product_name}</span>
                    <span class="order-item-qty">×${item.quantity}</span>
                    <span class="order-item-price">$${(item.price * item.quantity).toLocaleString()} MXN</span>
                </div>
            </div>`;
        }).join('');

        const card = document.createElement('article');
        card.classList.add('order-card');
        card.innerHTML = `
            <div class="order-card-header">
                <div class="order-meta">
                    <span class="order-id">#${String(order.id).padStart(5, '0')}</span>
                    <span class="order-date">${fecha}</span>
                </div>
                <span class="order-status" style="background:${status.color}20;color:${status.color};border:1px solid ${status.color}40">
                    ${status.text}
                </span>
            </div>
            <div class="order-items-list">${itemsHTML}</div>
            <div class="order-card-footer">
                <span class="order-payment">
                    <i class="fas fa-${order.payment_method === 'card' ? 'credit-card' : order.payment_method === 'oxxo' ? 'store' : 'university'}"></i>
                    ${order.payment_method === 'card' ? 'Tarjeta' : order.payment_method === 'oxxo' ? 'OXXO' : 'Transferencia'}
                </span>
                <span class="order-total">Total: <strong>$${Number(order.total).toLocaleString()} MXN</strong></span>
            </div>`;

        ordersList.appendChild(card);
    });
}

/* ── Init ── */
loadUserProfile();
loadOrders();
