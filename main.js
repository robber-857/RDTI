(() => {
  'use strict';

  const menu = document.getElementById('mobile-nav');
  const button = document.querySelector('.menu-btn');
  const links = [...document.querySelectorAll('.desktop-nav a, #mobile-nav a')];
  const sections = [...document.querySelectorAll('#main > section')];
  const mobile = matchMedia('(max-width:800px)');

  function setMenu(open) {
    menu.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
    button.querySelector('use').setAttribute('href', open ? '#close' : '#menu');
  }
  button.addEventListener('click', () => setMenu(menu.hidden));
  mobile.addEventListener('change', () => setMenu(false));
  document.addEventListener('click', event => {
    if (menu.hidden || button.contains(event.target)) return;
    if (!menu.contains(event.target) || event.target.closest('a, button')) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) {
      setMenu(false);
      button.focus();
    }
  });

  let pending = false;
  function updateActiveSection() {
    pending = false;
    const marker = Math.min(innerHeight * .36, 240);
    const current = sections.find(section => {
      const bounds = section.getBoundingClientRect();
      return bounds.top <= marker && bounds.bottom > marker;
    });
    links.forEach(link => {
      if (current?.id && link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(updateActiveSection);
  }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  addEventListener('pageshow', schedule);
  updateActiveSection();
})();
