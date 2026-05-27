/* ================= PRODUCT DETAIL MODULE ================= */

const BASE_URL = '/Proyecto_Final/QueretaRock/';

if (document.getElementById('productName') || document.querySelector('#productImage')) {

    const params    = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    const productImage       = document.getElementById('productImage');
    const productName        = document.getElementById('productName');
    const productPrice       = document.getElementById('productPrice');
    const productDescription = document.getElementById('productDescription');
    const addToCartBtn       = document.getElementById('addToCartBtn');
    const toast              = document.querySelector('.toast');

    async function loadProduct() {
        if (!productId) {
            if (productName) productName.textContent = 'Producto no encontrado';
            return;
        }
        try {
            const res     = await fetch(`${BASE_URL}backend/products/getProduct.php?id=${productId}`);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const product = await res.json();

            if (!product || !product.id) {
                if (productName) productName.textContent = 'Producto no encontrado';
                return;
            }

            if (productImage) {
                productImage.src = product.image
                    ? (product.image.startsWith('http') ? product.image : BASE_URL + product.image)
                    : '';
                productImage.alt = product.name;
            }
            if (productName)        productName.textContent  = product.name;
            if (productPrice)       productPrice.textContent = `$${Number(product.price).toLocaleString()} MXN`;
            if (productDescription) productDescription.textContent = product.description || 'Guitarra de alta calidad.';

            if (addToCartBtn) addToCartBtn.addEventListener('click', () => addToCart(product));

        } catch (err) {
            console.error('Error cargando producto:', err);
            if (productName) productName.textContent = 'Error al cargar el producto';
        }
    }

    function addToCart(product) {
        let cart = [];
        try {
            const raw = localStorage.getItem('cart');
            cart = (raw && raw !== 'undefined') ? JSON.parse(raw) : [];
            if (!Array.isArray(cart)) cart = [];
        } catch { cart = []; }

        const existing = cart.find(i => String(i.id) === String(product.id));
        if (existing) {
            existing.quantity = (Number(existing.quantity) || 1) + 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));

        // FIX: mismo patrón que products.js
        if (typeof window._cartRefresh === 'function') window._cartRefresh();

        showToast();
    }

    function showToast() {
        if (!toast) return;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    loadProduct();
}
