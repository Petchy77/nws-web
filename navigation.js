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
})();
