/* ================= CART MODULE ================= */

const cartButton  = document.getElementById('cartButton');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart   = document.getElementById('closeCart');
const cartContent = document.getElementById('cartContent');
const cartCount   = document.getElementById('cartCount');
const cartTotal   = document.getElementById('cartTotal');

/* ================= SAFE CART ================= */

function getCart() {
    const raw = localStorage.getItem('cart');
    if (!raw || raw === 'undefined' || raw === 'null') return [];
    try {
        const parsed = JSON.parse(raw);
        /* Filtra productos inválidos: deben tener id, nombre y precio válido */
        return parsed.filter(p =>
            p &&
            p.id !== undefined &&
            p.name &&
            Number(p.price) > 0
        );
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

if (closeCart)   closeCart.addEventListener('click', closeCartSidebar);
if (cartOverlay) cartOverlay.addEventListener('click', closeCartSidebar);

function closeCartSidebar() {
    cartSidebar?.classList.remove('active');
    cartOverlay?.classList.remove('active');
}

/* ================= RENDER ================= */

function renderCart() {
    if (!cartContent) return;

    const cart = getCart();
    cartContent.innerHTML = '';

    let total      = 0;
    let totalItems = 0;

    if (cart.length === 0) {
        cartContent.innerHTML = `
            <p style="padding:2rem;text-align:center;color:#888;">
                Tu carrito está vacío
            </p>`;
        if (cartTotal) cartTotal.textContent = '$0 MXN';
        if (cartCount) cartCount.textContent = '0';
        return;
    }

    cart.forEach(product => {
        const price    = Number(product.price)    || 0;
        const quantity = Number(product.quantity) || 1;

        total      += price * quantity;
        totalItems += quantity;

        const item = document.createElement('div');
        item.classList.add('cart-item');
        item.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="item-details">
                <h3>${product.name}</h3>
                <div class="item-price">$${price.toLocaleString()} MXN</div>
                <div class="quantity-controls">
                    <button class="qty-btn minus" data-id="${product.id}">-</button>
                    <span>${quantity}</span>
                    <button class="qty-btn plus" data-id="${product.id}">+</button>
                    <button class="delete-btn" data-id="${product.id}">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
            </div>`;

        cartContent.appendChild(item);
    });

    if (cartTotal) cartTotal.textContent = `$${total.toLocaleString()} MXN`;
    if (cartCount) cartCount.textContent = totalItems;

    cartContent.querySelectorAll('.qty-btn.minus').forEach(btn =>
        btn.addEventListener('click', () => changeQuantity(btn.dataset.id, -1))
    );
    cartContent.querySelectorAll('.qty-btn.plus').forEach(btn =>
        btn.addEventListener('click', () => changeQuantity(btn.dataset.id, 1))
    );
    cartContent.querySelectorAll('.delete-btn').forEach(btn =>
        btn.addEventListener('click', () => removeFromCart(btn.dataset.id))
    );
}

/* ================= QUANTITY ================= */

function changeQuantity(id, delta) {
    let cart = getCart().map(p => {
        if (p.id == id) p.quantity = (Number(p.quantity) || 1) + delta;
        return p;
    }).filter(p => p.quantity > 0);
    saveCart(cart);
}

/* ================= DELETE ================= */

function removeFromCart(id) {
    saveCart(getCart().filter(p => p.id != id));
}

/* ================= STORAGE EVENT ================= */

window.addEventListener('storage', () => {
    renderCart();
    updateCartCount();
});

/* ================= SANITIZE ON LOAD ================= */
/* Elimina cualquier producto hardcodeado del viejo data/products.js */

(function sanitizeCart() {
    const raw = localStorage.getItem('cart');
    if (!raw) return;
    try {
        const parsed = JSON.parse(raw);
        const clean  = parsed.filter(p =>
            p && p.id !== undefined && p.name && Number(p.price) > 0
        );
        if (clean.length !== parsed.length) {
            localStorage.setItem('cart', JSON.stringify(clean));
        }
    } catch {
        localStorage.removeItem('cart');
    }
})();

updateCartCount();
renderCart();
