const BASE_URL = '/Proyecto_Final/QueretaRock/';

function getCart() {
    try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; }
}

function getUsuario() {
    try { return JSON.parse(localStorage.getItem('usuario') || 'null'); } catch { return null; }
}

/* ── Pre-fill user data ── */
const usuario = getUsuario();
if (usuario) {
    const n = document.getElementById('chkNombre');
    const a = document.getElementById('chkApellido');
    const e = document.getElementById('chkEmail');
    const t = document.getElementById('chkTelefono');
    if (n) n.value = usuario.nombre   || '';
    if (a) a.value = usuario.apellido || '';
    if (e) e.value = usuario.email    || '';
    if (t) t.value = usuario.telefono || '';
}

/* ── Render summary ── */
function renderSummary() {
    const cart = getCart();
    const summaryItems = document.getElementById('summaryItems');
    const summaryTotal = document.getElementById('summaryTotal');
    if (!summaryItems) return;

    if (cart.length === 0) {
        summaryItems.innerHTML = '<p style="color:#888;">Tu carrito está vacío.</p>';
        return;
    }

    let total = 0;
    summaryItems.innerHTML = cart.map(p => {
        const price = Number(p.price) || 0;
        const qty   = Number(p.quantity) || 1;
        total += price * qty;
        return `
        <div class="summary-item">
            <img src="${p.image}" alt="${p.name}">
            <div class="summary-item-info">
                <h4>${p.name}</h4>
                <p>$${price.toLocaleString()} MXN</p>
            </div>
            <span class="summary-item-qty">x${qty}</span>
        </div>`;
    }).join('');

    if (summaryTotal) summaryTotal.textContent = `$${total.toLocaleString()} MXN`;
}

/* ── Card format ── */
const cardInput = document.getElementById('chkCard');
cardInput?.addEventListener('input', () => {
    let v = cardInput.value.replace(/\D/g, '').substring(0, 16);
    cardInput.value = v.match(/.{1,4}/g)?.join(' ') || v;
});

const expInput = document.getElementById('chkExp');
expInput?.addEventListener('input', () => {
    let v = expInput.value.replace(/\D/g, '').substring(0, 4);
    if (v.length > 2) v = v.substring(0,2) + '/' + v.substring(2);
    expInput.value = v;
});

/* ── Payment method toggle ── */
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
    btn.textContent = 'Procesando...';
    btn.disabled = true;

    /* Simula procesamiento (aquí conectarías con tu backend de pagos) */
    await new Promise(r => setTimeout(r, 1800));

    /* Incrementa sales_count en BD */
    try {
        await fetch(BASE_URL + 'backend/orders/createOrder.php', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                usuario_id: usuario?.id || null,
                items:      cart
            })
        });
    } catch (err) {
        console.warn('Order endpoint not ready:', err);
    }

    /* Limpia carrito y muestra éxito */
    localStorage.removeItem('cart');
    document.getElementById('successModal').classList.add('show');
});

renderSummary();