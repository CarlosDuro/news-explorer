/* Toggle menú móvil */
const burger = document.querySelector('[data-burger]');
const mobile = document.querySelector('[data-mobile]');
if (burger && mobile) {
  burger.addEventListener('click', () => {
    const open = mobile.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
}

/* Demo: alternar estado autenticado (solo desarrollo)
   - Abre la consola y ejecuta: toggleAuth()
*/
window.toggleAuth = function () {
  document.body.classList.toggle('is-authenticated');
};
