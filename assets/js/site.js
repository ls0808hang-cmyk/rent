document.addEventListener('DOMContentLoaded', () => {
  console.log('전월세비교기 사이트가 로드되었습니다.');

  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  const yearTargets = document.querySelectorAll('[data-current-year]');

  yearTargets.forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
});
