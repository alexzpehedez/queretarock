const BASE_URL = '/Proyecto_Final/QueretaRock/';

const params     = new URLSearchParams(window.location.search);
const productId  = params.get('id');

const productImage       = document.querySelector('#productImage');
const productName        = document.querySelector('#productName');
const productPrice       = document.querySelector('#productPrice');
const productDescription = document.querySelector('#productDescription');
const addToCartBtn       = document.querySelector('#addToCartBtn');
const toast              = document.querySelector('.toast');

/* ================= LOAD PRODUCT ================= */

async function loadProduct() {
    if (!productId) {
        if (productName) productName.textContent = 'Producto no encontrado';
        return;
    }

    try {
        const response = await fetch(
            `${BASE_URL}backend/products/getProduct.php?id=${productId}`
        );
        const product = await response.json();

        if (!product || !product.id) {
            if (productName) productName.textContent = 'Producto no encontrado';
            return;
        }

        if (productImage) {
            productImage.src = BASE_URL + product.image;
            productImage.alt = product.name;
        }
        if (productName)        productName.textContent  = product.name;
        if (productPrice)       productPrice.textContent = `$${Number(product.price).toLocaleString()} MXN`;
        if (productDescription) productDescription.textContent = product.description || 'Guitarra de alta calidad.';

        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => addToCart(product));
        }

    } catch (error) {
        console.error('Error cargando producto:', error);
    }
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

/* ================= INIT ================= */

loadProduct();
