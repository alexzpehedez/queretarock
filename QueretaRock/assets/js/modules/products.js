const productsContainer =
document.querySelector('.products-grid');

const BASE_URL = "/Proyecto_Final/QueretaRock/";

async function loadProducts() {

    try {

        const response = await fetch(
            BASE_URL + 'backend/products/getProducts.php'
        );

        const products = await response.json();

        renderProducts(products);

    } catch (error) {
        console.log(error);
    }
}

function renderProducts(products) {

    if (!productsContainer) return;

    productsContainer.innerHTML = '';

    products.forEach(product => {

        const card = document.createElement('div');
        card.classList.add('product-card');

        // 🔥 FIX IMPORTANTE AQUÍ
        const imageURL = BASE_URL + product.image;

        card.innerHTML = `

            <img src="${imageURL}" alt="${product.name}">

            <div class="product-info">

                <h3>${product.name}</h3>

                <p>
                    $${Number(product.price).toLocaleString()} MXN
                </p>

                <a href="product.html?id=${product.id}">
                    <button>Ver producto</button>
                </a>

            </div>
        `;

        productsContainer.appendChild(card);
    });
}

loadProducts();