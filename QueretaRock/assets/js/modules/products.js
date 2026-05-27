/* ================= PRODUCTS MODULE v2 ================= */

const BASE_URL = '/Proyecto_Final/QueretaRock/';

const productsGrid = document.getElementById('productsGrid')
                  || document.querySelector('.products-grid');
const searchInput  = document.getElementById('searchInput');
const sortSelect   = document.getElementById('sortSelect');
const priceRange   = document.getElementById('priceRange');
const priceLabel   = document.getElementById('priceLabel');
const toast        = document.getElementById('toast') || document.querySelector('.toast');
const filtersTitle = document.getElementById('filtersActiveTitle'); // opcional

let allProducts = [];

/* ================= PARSE URL PARAMS ================= */

function getURLFilters() {
    const p = new URLSearchParams(window.location.search);
    return {
        category: p.get('category') || '',   // Ej: "Electrica"
        brand:    p.get('brand')    || '',   // Ej: "Fender"
        model:    p.get('model')    || ''    // Ej: "Stratocaster"
    };
}

/* ================= LOAD ================= */

async function loadProducts() {
    if (!productsGrid) return;

    const { category, brand, model } = getURLFilters();

    // Muestra tag de filtro activo si hay uno
    updateActiveFilterBadge(category, brand, model);

    // Pre-marca los checkboxes de marca si viene en la URL
    if (brand) {
        document.querySelectorAll('.filters input[type=checkbox]').forEach(cb => {
            if (cb.value.toLowerCase() === brand.toLowerCase()) cb.checked = true;
        });
    }

    // Construye URL del backend con filtros
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (brand)    params.set('brand',    brand);
    if (model)    params.set('model',    model);

    const url = BASE_URL + 'backend/products/getProducts.php?' + params.toString();

    try {
        const res = await fetch(url);
        const text = await res.text();
        try {
            allProducts = JSON.parse(text);
        } catch {
            console.error('Error PHP en getProducts:', text.substring(0, 300));
            showGridError('Error al cargar productos. Verifica que el servidor esté activo.');
            return;
        }
        applyFilters();
    } catch (err) {
        console.error('Error de red:', err);
        showGridError('Error de conexión con el servidor.');
    }
}

function showGridError(msg) {
    if (productsGrid) {
        productsGrid.innerHTML = `<p style="color:#888;padding:2rem;grid-column:1/-1;text-align:center;">${msg}</p>`;
    }
}

/* ================= BADGE DE FILTRO ACTIVO ================= */

function updateActiveFilterBadge(category, brand, model) {
    const container = document.getElementById('activeFiltersBar');
    if (!container) return;

    const tags = [];
    if (category) tags.push(`Categoría: <strong>${category}</strong>`);
    if (brand)    tags.push(`Marca: <strong>${brand}</strong>`);
    if (model)    tags.push(`Modelo: <strong>${model}</strong>`);

    if (tags.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'flex';
    container.innerHTML = `
        <span class="filter-badge-label">Filtros activos:</span>
        ${tags.map(t => `<span class="filter-badge">${t}</span>`).join('')}
        <a href="products.html" class="filter-clear">
            <i class="fas fa-times"></i> Limpiar filtros
        </a>`;
}

/* ================= FILTERS LOCALES (precio, búsqueda, orden) ================= */

function applyFilters() {
    const query    = searchInput?.value.toLowerCase().trim() || '';
    const sortVal  = sortSelect?.value || '';
    const maxPrice = Number(priceRange?.value) || 100000;

    // Marcas de los checkboxes (filtro adicional local sobre lo que ya llegó de BD)
    const checkedBrands = [...document.querySelectorAll('.filters input[type=checkbox]:checked')]
        .map(cb => cb.value.toLowerCase());

    let filtered = allProducts.filter(p => {
        const matchSearch = !query ||
            p.name.toLowerCase().includes(query) ||
            p.brand.toLowerCase().includes(query);
        const matchBrand  = checkedBrands.length === 0 ||
            checkedBrands.includes((p.brand || '').toLowerCase());
        const matchPrice  = Number(p.price) <= maxPrice;
        return matchSearch && matchBrand && matchPrice;
    });

    if (sortVal === 'low')  filtered.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortVal === 'high') filtered.sort((a, b) => Number(b.price) - Number(a.price));

    renderProducts(filtered);
}

/* ================= RENDER ================= */

function renderProducts(products) {
    if (!productsGrid) return;
    productsGrid.innerHTML = '';

    if (products.length === 0) {
        productsGrid.innerHTML =
            '<p style="color:#888;grid-column:1/-1;text-align:center;padding:3rem;">No se encontraron productos con esos filtros.</p>';
        return;
    }

    products.forEach((product, i) => {
        const card     = document.createElement('div');
        card.classList.add('product-card');
        card.style.animationDelay = `${i * 0.04}s`;

        const imageURL = product.image
            ? (product.image.startsWith('http') ? product.image : BASE_URL + product.image)
            : '';

        card.innerHTML = `
            <img src="${imageURL}" alt="${product.name}" loading="lazy"
                 onerror="this.style.background='#1b1b1b';this.style.minHeight='200px'">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price">$${Number(product.price).toLocaleString()} MXN</p>
                <div class="product-buttons">
                    <a class="view-btn" href="product.html?id=${product.id}">Ver detalle</a>
                    <button class="add-cart-btn" aria-label="Agregar al carrito"
                            data-product='${JSON.stringify(product).replace(/'/g, "&#39;")}'>
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
            </div>`;

        card.querySelector('.add-cart-btn').addEventListener('click', e => {
            addToCart(JSON.parse(
                e.currentTarget.dataset.product.replace(/&#39;/g, "'")
            ));
        });

        productsGrid.appendChild(card);
    });
}

/* ================= ADD TO CART ================= */

function addToCart(product) {
    let cart = [];
    try { cart = JSON.parse(localStorage.getItem('cart') || '[]'); } catch { cart = []; }
    if (!Array.isArray(cart)) cart = [];

    const existing = cart.find(i => String(i.id) === String(product.id));
    if (existing) {
        existing.quantity = (Number(existing.quantity) || 1) + 1;
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