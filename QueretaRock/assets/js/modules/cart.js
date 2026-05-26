const cartButton =
document.getElementById('cartButton');

const cartSidebar =
document.getElementById('cartSidebar');

const cartOverlay =
document.getElementById('cartOverlay');

const closeCart =
document.getElementById('closeCart');

const cartContent =
document.getElementById('cartContent');

const cartCount =
document.getElementById('cartCount');

const cartTotal =
document.getElementById('cartTotal');

/* ================= SAFE CART ================= */

function getCart(){

    const raw =
    localStorage.getItem('cart');

    if(
        !raw ||
        raw === 'undefined' ||
        raw === 'null'
    ){

        return [];
    }

    try{

        return JSON.parse(raw);

    }catch(error){

        console.log(
            'Carrito corrupto'
        );

        localStorage.removeItem(
            'cart'
        );

        return [];
    }
}

/* ================= OPEN CART ================= */

if(cartButton){

    cartButton.addEventListener(
        'click',
        () => {

            if(cartSidebar){

                cartSidebar.classList.add(
                    'active'
                );
            }

            if(cartOverlay){

                cartOverlay.classList.add(
                    'active'
                );
            }

            renderCart();
        }
    );
}

/* ================= CLOSE CART ================= */

if(closeCart){

    closeCart.addEventListener(
        'click',
        closeCartSidebar
    );
}

if(cartOverlay){

    cartOverlay.addEventListener(
        'click',
        closeCartSidebar
    );
}

function closeCartSidebar(){

    if(cartSidebar){

        cartSidebar.classList.remove(
            'active'
        );
    }

    if(cartOverlay){

        cartOverlay.classList.remove(
            'active'
        );
    }
}

/* ================= SAVE CART ================= */

function saveCart(cart){

    localStorage.setItem(
        'cart',
        JSON.stringify(cart)
    );

    renderCart();
}

/* ================= RENDER CART ================= */

function renderCart(){

    if(!cartContent) return;

    const cart =
    getCart();

    cartContent.innerHTML = '';

    let total = 0;
    let totalItems = 0;

    if(cart.length === 0){

        cartContent.innerHTML = `

            <p class="empty-cart">
                Tu carrito está vacío
            </p>

        `;

        if(cartTotal){

            cartTotal.textContent =
            '$0 MXN';
        }

        if(cartCount){

            cartCount.textContent =
            '0';
        }

        return;
    }

    cart.forEach(product => {

        const price =
        Number(product.price) || 0;

        const quantity =
        Number(product.quantity) || 1;

        total +=
        price * quantity;

        totalItems +=
        quantity;

        const item =
        document.createElement('div');

        item.classList.add(
            'cart-item'
        );

        item.innerHTML = `

            <img
            src="${product.image}"
            alt="${product.name}">

            <div class="item-details">

                <h3>
                    ${product.name}
                </h3>

                <div class="item-price">

                    $${price.toLocaleString()} MXN

                </div>

                <div class="quantity-controls">

                    <span>
                        Cantidad:
                        ${quantity}
                    </span>

                    <button
                    class="delete-btn"
                    data-id="${product.id}">

                        <i class="fa-regular fa-trash-can"></i>

                    </button>

                </div>

            </div>
        `;

        cartContent.appendChild(item);
    });

    /* ================= TOTAL ================= */

    if(cartTotal){

        cartTotal.textContent =
        `$${total.toLocaleString()} MXN`;
    }

    /* ================= COUNT ================= */

    if(cartCount){

        cartCount.textContent =
        totalItems;
    }

    activateDeleteButtons();
}

/* ================= DELETE ================= */

function activateDeleteButtons(){

    const buttons =
    document.querySelectorAll(
        '.delete-btn'
    );

    buttons.forEach(button => {

        button.addEventListener(
            'click',
            () => {

                const id =
                button.dataset.id;

                removeFromCart(id);
            }
        );
    });
}

function removeFromCart(id){

    let cart =
    getCart();

    cart =
    cart.filter(product =>
        product.id != id
    );

    saveCart(cart);
}

/* ================= STORAGE UPDATE ================= */

window.addEventListener(
    'storage',
    renderCart
);

/* ================= INIT ================= */

renderCart();