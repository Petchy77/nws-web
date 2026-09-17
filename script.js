const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');

menuButton?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', isOpen);
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));

document.querySelector('#year').textContent = new Date().getFullYear();

const assessmentForm = document.querySelector('#assessment-form');
const formStatus = document.querySelector('#form-status');

assessmentForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!assessmentForm.checkValidity()) {
    assessmentForm.reportValidity();
    return;
  }

  const data = new FormData(assessmentForm);
  const value = (name) => data.get(name)?.trim() || '-';
  const subject = `คำขอประเมินโครงการ: ${value('company')}`;
  const body = [
    'คำขอเริ่มต้นการประเมินโครงการ',
    '',
    `ชื่อผู้ติดต่อ: ${value('name')}`,
    `องค์กร: ${value('company')}`,
    `อีเมล: ${value('email')}`,
    `โทรศัพท์: ${value('phone')}`,
    '',
    'ขอบเขตหรือความต้องการ:',
    value('message'),
  ].join('\n');

  formStatus.textContent = 'กำลังเปิดโปรแกรมอีเมลเพื่อส่งถึง support@nwsthai.com';
  window.location.href = `mailto:support@nwsthai.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
