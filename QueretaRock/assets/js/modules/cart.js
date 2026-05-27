/* ================= CART MODULE ================= */

const BASE_URL = '/Proyecto_Final/QueretaRock/';

const cartButton   = document.getElementById('cartButton');
const cartSidebar  = document.getElementById('cartSidebar');
const cartOverlay  = document.getElementById('cartOverlay') || document.querySelector('.cart-overlay');
const closeCartBtn = document.getElementById('closeCart');
const cartContent  = document.getElementById('cartContent');
const cartCount    = document.getElementById('cartCount');
const cartTotal    = document.getElementById('cartTotal');
const checkoutBtn  = document.getElementById('checkoutBtn') || document.querySelector('.checkout-btn');

/* ================= SAFE CART ================= */

function getCart() {
    const raw = localStorage.getItem('cart');
    if (!raw || raw === 'undefined' || raw === 'null') return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed)
            ? parsed.filter(p => p && p.id !== undefined && p.name && Number(p.price) > 0)
            : [];
    } catch {
        localStorage.removeItem('cart');
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
}

/* ================= COUNT ================= */

function updateCartCount() {
    if (!cartCount) return;
    const total = getCart().reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
    cartCount.textContent = total;
}

/* ================= OPEN / CLOSE ================= */

if (cartButton) {
    cartButton.addEventListener('click', () => {
        cartSidebar?.classList.add('active');
        cartOverlay?.classList.add('active');
        renderCart();
    });
}

if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartSidebar);
if (cartOverlay)  cartOverlay.addEventListener('click', closeCartSidebar);

function closeCartSidebar() {
    cartSidebar?.classList.remove('active');
    cartOverlay?.classList.remove('active');
}

/* ================= CHECKOUT REDIRECT ================= */

if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        const cart = getCart();
        if (cart.length === 0) { alert('Tu carrito está vacío'); return; }
        const isRoot = !window.location.pathname.includes('/pages/');
        const path   = isRoot ? BASE_URL + 'pages/checkout.html' : 'checkout.html';
        window.location.href = path;
    });
}

/* ================= RENDER ================= */

function renderCart() {
    if (!cartContent) return;
    const cart = getCart();
    cartContent.innerHTML = '';
    let total = 0, totalItems = 0;

    if (cart.length === 0) {
        cartContent.innerHTML = `<p style="padding:2rem;text-align:center;color:#888;">Tu carrito está vacío</p>`;
        if (cartTotal) cartTotal.textContent = '$0 MXN';
        if (cartCount) cartCount.textContent = '0';
        return;
    }

    cart.forEach(product => {
        const price    = Number(product.price)    || 0;
        const quantity = Number(product.quantity) || 1;
        const imageURL = product.image
            ? (product.image.startsWith('http') ? product.image : BASE_URL + product.image)
            : '';
        total      += price * quantity;
        totalItems += quantity;

        const item = document.createElement('div');
        item.classList.add('cart-item');
        item.innerHTML = `
            <img src="${imageURL}" alt="${product.name}" onerror="this.style.display='none'">
            <div class="item-details">
                <h3>${product.name}</h3>
                <div class="item-price">$${price.toLocaleString()} MXN</div>
                <div class="quantity-controls">
                    <button class="qty-btn minus" data-id="${product.id}">-</button>
                    <span>${quantity}</span>
                    <button class="qty-btn plus"  data-id="${product.id}">+</button>
                    <button class="delete-btn"    data-id="${product.id}">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
            </div>`;
        cartContent.appendChild(item);
    });

    if (cartTotal) cartTotal.textContent = `$${total.toLocaleString()} MXN`;
    if (cartCount) cartCount.textContent = totalItems;

    cartContent.querySelectorAll('.qty-btn.minus').forEach(btn =>
        btn.addEventListener('click', () => changeQuantity(btn.dataset.id, -1)));
    cartContent.querySelectorAll('.qty-btn.plus').forEach(btn =>
        btn.addEventListener('click', () => changeQuantity(btn.dataset.id, 1)));
    cartContent.querySelectorAll('.delete-btn').forEach(btn =>
        btn.addEventListener('click', () => removeFromCart(btn.dataset.id)));
}

/* ================= QUANTITY / DELETE ================= */

function changeQuantity(id, delta) {
    const cart = getCart()
        .map(p => { if (String(p.id) === String(id)) p.quantity = (Number(p.quantity) || 1) + delta; return p; })
        .filter(p => p.quantity > 0);
    saveCart(cart);
}

function removeFromCart(id) {
    saveCart(getCart().filter(p => String(p.id) !== String(id)));
}

/* ================= CROSS-TAB SYNC ================= */
// Solo sincroniza cambios hechos desde OTRA pestaña
window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
        renderCart();
        updateCartCount();
    }
});

/* ================= EXPONER REFRESH PARA products.js ================= */
// products.js llama a window._cartRefresh() tras agregar al carrito
// así evitamos depender del evento 'storage' que no se dispara en la misma pestaña
window._cartRefresh = () => {
    renderCart();
    updateCartCount();
};

/* ================= SANITIZE ON LOAD ================= */
(function sanitizeCart() {
    const raw = localStorage.getItem('cart');
    if (!raw) return;
    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) { localStorage.removeItem('cart'); return; }
        const clean = parsed.filter(p => p && p.id !== undefined && p.name && Number(p.price) > 0);
        if (clean.length !== parsed.length) localStorage.setItem('cart', JSON.stringify(clean));
    } catch { localStorage.removeItem('cart'); }
})();

updateCartCount();
renderCart();
