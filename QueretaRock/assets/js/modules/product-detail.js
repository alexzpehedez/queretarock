/* ================= PRODUCT DETAIL MODULE ================= */

const BASE_URL = '/Proyecto_Final/QueretaRock/';

// Solo actúa si estamos en la página de detalle
if (document.getElementById('productName') || document.querySelector('#productImage')) {

    const params    = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    const productImage       = document.getElementById('productImage');
    const productName        = document.getElementById('productName');
    const productPrice       = document.getElementById('productPrice');
    const productDescription = document.getElementById('productDescription');
    const addToCartBtn       = document.getElementById('addToCartBtn');
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
            if (!response.ok) throw new Error('HTTP ' + response.status);

            const product = await response.json();

            if (!product || !product.id) {
                if (productName) productName.textContent = 'Producto no encontrado';
                return;
            }

            if (productImage) {
                const imageURL = product.image
                    ? (product.image.startsWith('http') ? product.image : BASE_URL + product.image)
                    : '';
                productImage.src = imageURL;
                productImage.alt = product.name;
            }
            if (productName)        productName.textContent  = product.name;
            if (productPrice)       productPrice.textContent =
                `$${Number(product.price).toLocaleString()} MXN`;
            if (productDescription) productDescription.textContent =
                product.description || 'Guitarra de alta calidad.';

            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', () => addToCart(product));
            }

        } catch (error) {
            console.error('Error cargando producto:', error);
            if (productName) productName.textContent = 'Error al cargar el producto';
        }
    }

    /* ================= ADD TO CART ================= */

    function addToCart(product) {
        let cart = [];
        try {
            cart = JSON.parse(localStorage.getItem('cart') || '[]');
            if (!Array.isArray(cart)) cart = [];
        } catch { cart = []; }

        const existing = cart.find(item => String(item.id) === String(product.id));
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

    /* ================= INIT ================= */

    loadProduct();
}
