const cartButton = document.getElementById("cartButton");
const cartSidebar = document.getElementById("cartSidebar");
const cartOverlay = document.getElementById("cartOverlay");
const closeCart = document.getElementById("closeCart");

cartButton.addEventListener("click", () => {
    cartSidebar.classList.add("active");
    cartOverlay.classList.add("active");
});

closeCart.addEventListener("click", () => {
    cartSidebar.classList.remove("active");
    cartOverlay.classList.remove("active");
});

cartOverlay.addEventListener("click", () => {
    cartSidebar.classList.remove("active");
    cartOverlay.classList.remove("active");
});