/* ================= CHECKOUT MODULE v2 ================= */

const BASE_URL = '/Proyecto_Final/QueretaRock/';

function getCart() {
    try {
        const raw = localStorage.getItem('cart');
        if (!raw || raw === 'undefined' || raw === 'null') return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
}

function getUsuario() {
    try {
        const raw = localStorage.getItem('usuario');
        if (!raw || raw === 'undefined' || raw === 'null') return null;
        return JSON.parse(raw);
    } catch { return null; }
}

/* ── Pre-fill con datos del usuario ── */
const usuario = getUsuario();
if (usuario) {
    const map = {
        chkNombre:   usuario.nombre   || '',
        chkApellido: usuario.apellido || '',
        chkEmail:    usuario.email    || '',
        chkTelefono: usuario.telefono || ''
    };
    Object.entries(map).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    });
}

/* ── Renderiza resumen del pedido ── */
function renderSummary() {
    const cart        = getCart();
    const summaryItems = document.getElementById('summaryItems');
    const summaryTotal = document.getElementById('summaryTotal');
    if (!summaryItems) return;

    if (cart.length === 0) {
        summaryItems.innerHTML = '<p style="color:#888;text-align:center;padding:1rem;">Tu carrito está vacío.</p>';
        return;
    }

    let total = 0;
    summaryItems.innerHTML = cart.map(p => {
        const price    = Number(p.price) || 0;
        const qty      = Number(p.quantity) || 1;
        total         += price * qty;
        const imageURL = p.image
            ? (p.image.startsWith('http') ? p.image : BASE_URL + p.image)
            : '';
        return `
        <div class="summary-item">
            ${imageURL ? `<img src="${imageURL}" alt="${p.name}" onerror="this.style.display='none'">` : ''}
            <div class="summary-item-info">
                <h4>${p.name}</h4>
                <p>$${price.toLocaleString()} MXN</p>
            </div>
            <span class="summary-item-qty">×${qty}</span>
        </div>`;
    }).join('');

    if (summaryTotal) summaryTotal.textContent = `$${total.toLocaleString()} MXN`;
}

/* ── Formato de tarjeta ── */
document.getElementById('chkCard')?.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '').substring(0, 16);
    this.value = v.match(/.{1,4}/g)?.join(' ') || v;
});

document.getElementById('chkExp')?.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '').substring(0, 4);
    if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2);
    this.value = v;
});

/* ── Toggle campos tarjeta ── */
document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', () => {
        const cardFields = document.getElementById('cardFields');
        if (cardFields) cardFields.style.display = radio.value === 'card' ? 'block' : 'none';
    });
});

/* ── Submit ── */
document.getElementById('checkoutForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const cart = getCart();
    if (cart.length === 0) { alert('Tu carrito está vacío'); return; }

    const btn = e.target.querySelector('.place-order-btn');
    if (btn) { btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...'; btn.disabled = true; }

    // Datos del formulario
    const payment = document.querySelector('input[name="payment"]:checked')?.value || 'card';
    const payload = {
        usuario_id:     usuario?.id    || null,
        items:          cart,
        payment_method: payment,
        nombre:         document.getElementById('chkNombre')?.value.trim()    || '',
        apellido:       document.getElementById('chkApellido')?.value.trim()  || '',
        email:          document.getElementById('chkEmail')?.value.trim()     || '',
        telefono:       document.getElementById('chkTelefono')?.value.trim()  || '',
        direccion:      document.getElementById('chkDireccion')?.value.trim() || '',
        ciudad:         document.getElementById('chkCiudad')?.value.trim()    || '',
        cp:             document.getElementById('chkCP')?.value.trim()        || ''
    };

    // Simulación de delay de pago
    await new Promise(r => setTimeout(r, 1500));

    try {
        const res  = await fetch(BASE_URL + 'backend/orders/createOrder.php', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload)
        });
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch {
            console.warn('Respuesta no-JSON de createOrder:', text.substring(0, 200));
        }
        if (data && !data.success) {
            console.warn('Orden no guardada:', data.message);
        }
    } catch (err) {
        console.warn('Error al guardar orden (no bloquea flujo):', err);
    }

    // Limpia carrito y muestra éxito independientemente del backend
    localStorage.removeItem('cart');
    const modal = document.getElementById('successModal');
    if (modal) modal.classList.add('show');
});

/* ── Init ── */
renderSummary();
