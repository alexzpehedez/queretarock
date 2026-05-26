const menuBtn =
document.querySelector('.menu-btn');

const navMenu =
document.querySelector('#nav-menu');

if(menuBtn && navMenu){

    menuBtn.addEventListener(
        'click',
        () => {

            navMenu.classList.toggle(
                'show-menu'
            );
        }
    );
}