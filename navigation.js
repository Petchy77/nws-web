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

  document.querySelectorAll('img[alt*="cleanroom smart factory"]').forEach((image) => {
    image.src = '/assets/smart-factory.png';
  });

  const highResolutionVisuals = [
    ['ISA-95 Smart Manufacturing', '/assets/stitch-factory-01.png'],
    ['CEO Quote - New World Solutions', '/assets/stitch-nws-logo-dark.png'],
    ['Automated Silicon Wafer Handling', '/assets/stitch-factory-01.png'],
    ['Cleanroom semiconductor testing', '/assets/stitch-factory-02.png'],
    ['Industrial engineers analyzing', '/assets/stitch-lab-01.png'],
    ['Semiconductor automatic test equipment', '/assets/stitch-factory-03.png'],
    ['Advanced industrial high-tech cleanroom facility', '/assets/stitch-factory-04.png'],
  ];

  document.querySelectorAll('img').forEach((image) => {
    const description = image.alt || image.dataset.alt || '';
    const replacement = highResolutionVisuals.find(([hint]) => description.includes(hint));
    if (replacement) {
      image.src = replacement[1];
      image.decoding = 'async';
    }
  });

  document.querySelectorAll('a[href="mailto:Customer-Support@nwsthai.com"]').forEach((link) => {
    link.href = 'mailto:support@nwsthai.com';
    link.textContent = link.textContent.replace(/Customer-Support@nwsthai\.com/g, 'support@nwsthai.com');
  });

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.parentElement?.tagName !== 'SCRIPT') {
      node.nodeValue = node.nodeValue.replace(/34\+/g, '30+');
    }
  }

  const consultationForm = document.querySelector('#consultation-form');
  if (consultationForm) {
    consultationForm.addEventListener('submit', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const field = (selector) => consultationForm.querySelector(selector)?.value?.trim() || '-';
      const subject = 'Consultation request from nwsthai.com';
      const body = [
        `Name: ${field('#contact-name')}`,
        `Company: ${field('#company-name')}`,
        `Phone: ${field('input[type="tel"]')}`,
        `Email: ${field('input[type="email"]')}`,
        `Solution: ${field('#solution-focus')}`,
        '',
        'Project details:',
        field('#project-scope'),
      ].join('\n');
      window.location.href = `mailto:support@nwsthai.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }, true);
  }
})();
