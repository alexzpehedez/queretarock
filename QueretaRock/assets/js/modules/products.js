const BASE_URL = '/Proyecto_Final/QueretaRock/';

const productsGrid  = document.getElementById('productsGrid') 
                   || document.querySelector('.products-grid');
const searchInput   = document.getElementById('searchInput');
const sortSelect    = document.getElementById('sortSelect');
const priceRange    = document.getElementById('priceRange');
const priceLabel    = document.getElementById('priceLabel');
const toast         = document.getElementById('toast');

let allProducts = [];

/* ================= LOAD ================= */

async function loadProducts() {
    if (!productsGrid) return;

    try {
        const response = await fetch(BASE_URL + 'backend/products/getProducts.php');
        allProducts    = await response.json();
        applyFilters();
    } catch (error) {
        console.error('Error cargando productos:', error);
        productsGrid.innerHTML = '<p style="color:#888;padding:2rem;">Error al cargar productos.</p>';
    }
}

/* ================= FILTERS ================= */

function applyFilters() {
    const query     = searchInput?.value.toLowerCase().trim() || '';
    const sortVal   = sortSelect?.value || '';
    const maxPrice  = Number(priceRange?.value) || 100000;

    /* Marcas seleccionadas */
    const checkedBrands = [...document.querySelectorAll('.filters input[type=checkbox]:checked')]
        .map(cb => cb.value.toLowerCase());

    let filtered = allProducts.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(query) ||
                            p.brand.toLowerCase().includes(query);
        const matchBrand  = checkedBrands.length === 0 ||
                            checkedBrands.includes(p.brand.toLowerCase());
        const matchPrice  = Number(p.price) <= maxPrice;
        return matchSearch && matchBrand && matchPrice;
    });

    if (sortVal === 'low')  filtered.sort((a, b) => a.price - b.price);
    if (sortVal === 'high') filtered.sort((a, b) => b.price - a.price);

    renderProducts(filtered);
}

/* ================= RENDER ================= */

function renderProducts(products) {
    if (!productsGrid) return;
    productsGrid.innerHTML = '';

    if (products.length === 0) {
        productsGrid.innerHTML = '<p style="color:#888;grid-column:1/-1;text-align:center;padding:3rem;">No se encontraron productos.</p>';
        return;
    }

    products.forEach((product, i) => {
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.style.animationDelay = `${i * 0.05}s`;

        const imageURL = BASE_URL + product.image;

        card.innerHTML = `
            <img src="${imageURL}" alt="${product.name}" loading="lazy">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>$${Number(product.price).toLocaleString()} MXN</p>
                <div class="product-buttons">
                    <a class="view-btn" href="product.html?id=${product.id}">
                        Ver detalle
                    </a>
                    <button data-product='${JSON.stringify(product)}'>
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
            </div>`;

        /* Add to cart */
        card.querySelector('button').addEventListener('click', (e) => {
            const p = JSON.parse(e.currentTarget.dataset.product);
            addToCart(p);
        });

        productsGrid.appendChild(card);
    });
}

/* ================= ADD TO CART ================= */

function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    const existing = cart.find(item => item.id == product.id);
    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    showToast();
}

function showToast() {
    if (!toast) return;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ================= EVENTS ================= */

searchInput?.addEventListener('input', applyFilters);
sortSelect?.addEventListener('change', applyFilters);

priceRange?.addEventListener('input', () => {
    if (priceLabel) priceLabel.textContent = `$${Number(priceRange.value).toLocaleString()}`;
    applyFilters();
});

document.querySelectorAll('.filters input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', applyFilters);
});

/* ================= INIT ================= */

loadProducts();
