(() => {
  const paths = {
    home: '/',
    solutions: '/solutions/',
    'about-us': '/about/',
    contact: '/contact/',
    'privacy-policy': '/contact/',
    'terms-of-service': '/contact/',
    'security-standards': '/contact/',
  };

  document.querySelectorAll('[data-path]').forEach((link) => {
    const target = paths[link.dataset.path];
    if (target) link.href = target;
  });

  document.querySelectorAll('a[href="#"]').forEach((link) => {
    const label = link.textContent.toLowerCase();
    if (/consult|นัดหมาย|ปรึกษา|contact/.test(label)) link.href = '/contact/';
  });

  document.querySelectorAll('img[alt="Profile"]').forEach((logo) => {
    logo.src = '/assets/nws-mark.png';
    logo.alt = 'ตราบริษัท นิว เวิลด์ โซลูชั่นส์ จำกัด';
    logo.classList.remove('w-8', 'h-8', 'rounded-full');
    logo.classList.add('w-12', 'h-12', 'rounded');
    logo.style.objectFit = 'contain';
    logo.style.padding = '3px';
    logo.style.border = '1px solid rgba(0, 242, 254, .65)';
    logo.style.background = '#fff';
  });
})();
