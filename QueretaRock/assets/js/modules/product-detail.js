const BASE_URL =
"/Proyecto_Final/QueretaRock/";

const params =
new URLSearchParams(window.location.search);

const productId =
params.get('id');

const productImage =
document.querySelector('#productImage');

const productName =
document.querySelector('#productName');

const productPrice =
document.querySelector('#productPrice');

const productDescription =
document.querySelector('#productDescription');

const addToCartBtn =
document.querySelector('#addToCartBtn');

async function loadProduct(){

    try{

        const response = await fetch(
            `${BASE_URL}backend/products/getProduct.php?id=${productId}`
        );

        const product =
        await response.json();

        if(product){

            productImage.src =
            BASE_URL + product.image;

            productName.textContent =
            product.name;

            productPrice.textContent =
            `$${Number(product.price)
            .toLocaleString()} MXN`;

            productDescription.textContent =
            product.description;

            addToCartBtn.addEventListener(
                'click',
                () => addToCart(product)
            );
        }

    }catch(error){

        console.log(error);
    }
}

function addToCart(product){

    let cart =
    JSON.parse(
        localStorage.getItem("cart")
    ) || [];

    const existing =
    cart.find(item =>
        item.id == product.id
    );

    if(existing){

        existing.quantity++;

    }else{

        cart.push({
            ...product,
            quantity:1
        });
    }

localStorage.setItem(
    "cart",
    JSON.stringify(cart)
);

window.dispatchEvent(
    new Event('storage')
);

alert("Producto agregado al carrito");

    
}

loadProduct();