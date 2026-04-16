const RSVP_CONFIG = {
  endpoint: '/.netlify/functions/rsvp',
  event: {
    celebrant: 'Виктория',
    date: '01 мая 2026',
    time: '16:00',
    place: 'Ресторан «Шале Берёзка»',
    hall: 'Каминный зал',
    city: 'Новогорск'
  }
};

const dom = {
  body: document.body,
  particles: document.getElementById('particles'),
  imageModal: document.getElementById('imageModal'),
  openModalBtn: document.getElementById('openModalBtn'),
  themeButtons: document.querySelectorAll('[data-theme-target]'),
  revealElements: document.querySelectorAll('.reveal'),
  tiltCards: document.querySelectorAll('.tilt-card'),
  days: document.getElementById('days'),
  hours: document.getElementById('hours'),
  minutes: document.getElementById('minutes'),
  seconds: document.getElementById('seconds'),
  guestName: document.getElementById('guestName'),
  guestPhone: document.getElementById('guestPhone'),
  guestCount: document.getElementById('guestCount'),
  attendance: document.getElementById('attendance'),
  guestMessage: document.getElementById('guestMessage'),
  messagePreview: document.getElementById('messagePreview'),
  submitRsvpBtn: document.getElementById('submitRsvpBtn'),
  telegramShareBtn: document.getElementById('telegramShareBtn'),
  copyBtn: document.getElementById('copyBtn'),
  saveBtn: document.getElementById('saveBtn'),
  resetBtn: document.getElementById('resetBtn'),
  copyStatus: document.getElementById('copyStatus'),
  saveStatus: document.getElementById('saveStatus'),
  errorStatus: document.getElementById('errorStatus'),
  submitStatus: document.getElementById('submitStatus')
};

function init() {
  initTheme();
  initReveal();
  initTilt();
  initParticles();
  initCountdown();
  initModal();
  initRsvp();
}

function initTheme() {
  const savedTheme = localStorage.getItem('invite-theme');
  if (savedTheme) setTheme(savedTheme);
  dom.themeButtons.forEach((button) => {
    button.addEventListener('click', () => setTheme(button.getAttribute('data-theme-target')));
  });
}

function setTheme(theme) {
  dom.body.setAttribute('data-theme', theme);
  dom.themeButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-theme-target') === theme);
  });
  localStorage.setItem('invite-theme', theme);
}

function initReveal() {
  const onScroll = () => {
    dom.revealElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight - 80) element.classList.add('show');
    });
  };
  onScroll();
  window.addEventListener('scroll', onScroll);
}

function initTilt() {
  dom.tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (event) => {
      if (window.innerWidth < 1024) return;
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    });
  });
}

function initParticles() {
  if (!dom.particles) return;
  for (let i = 0; i < 34; i += 1) {
    const dot = document.createElement('span');
    dot.className = 'particle';
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.bottom = `${-10 - Math.random() * 20}px`;
    dot.style.animationDuration = `${10 + Math.random() * 12}s`;
    dot.style.animationDelay = `${Math.random() * 12}s`;
    dot.style.opacity = `${0.16 + Math.random() * 0.3}`;
    dot.style.width = `${2 + Math.random() * 3}px`;
    dot.style.height = dot.style.width;
    dom.particles.appendChild(dot);
  }
}

function initCountdown() {
  const targetDate = new Date('2026-05-01T16:00:00+03:00').getTime();
  const pad = (value) => String(value).padStart(2, '0');
  const update = () => {
    const now = Date.now();
    const diff = Math.max(targetDate - now, 0);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    dom.days.textContent = pad(days);
    dom.hours.textContent = pad(hours);
    dom.minutes.textContent = pad(minutes);
    dom.seconds.textContent = pad(seconds);
  };
  update();
  setInterval(update, 1000);
}

function initModal() {
  dom.openModalBtn.addEventListener('click', () => toggleModal(true));
  dom.imageModal.addEventListener('click', () => toggleModal(false));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') toggleModal(false);
  });
}

function toggleModal(isOpen) {
  dom.imageModal.classList.toggle('open', isOpen);
  dom.imageModal.setAttribute('aria-hidden', String(!isOpen));
}

function initRsvp() {
  loadDraft();
  buildMessage();
  [dom.guestName, dom.guestPhone, dom.guestCount, dom.attendance, dom.guestMessage].forEach((field) => {
    field.addEventListener('input', handleRsvpInput);
    field.addEventListener('change', handleRsvpInput);
  });
  dom.telegramShareBtn.addEventListener('click', shareTelegram);
  dom.copyBtn.addEventListener('click', copyMessage);
  dom.saveBtn.addEventListener('click', saveDraftStatus);
  dom.resetBtn.addEventListener('click', resetForm);
  dom.submitRsvpBtn.addEventListener('click', submitRsvp);
}

function handleRsvpInput() {
  buildMessage();
  saveDraft();
}

function getFormData() {
  return {
    name: dom.guestName.value.trim(),
    phone: dom.guestPhone.value.trim() || 'не указан',
    count: dom.guestCount.value,
    status: dom.attendance.value,
    comment: dom.guestMessage.value.trim()
  };
}

function validateForm() {
  const valid = dom.guestName.value.trim().length > 0;
  if (!valid) showStatus(dom.errorStatus);
  return valid;
}

function buildMessage() {
  const data = getFormData();
  const lines = [
    'Здравствуйте!',
    '',
    `${data.status} на праздник ${RSVP_CONFIG.event.celebrant}.`,
    '',
    `Имя: ${data.name || 'Гость'}`,
    `Контакт: ${data.phone}`,
    `Количество гостей: ${data.count}`,
    '',
    `Дата: ${RSVP_CONFIG.event.date}`,
    `Время: ${RSVP_CONFIG.event.time}`,
    `Место: ${RSVP_CONFIG.event.place}`,
    `Зал: ${RSVP_CONFIG.event.hall}`,
    `Город: ${RSVP_CONFIG.event.city}`
  ];
  if (data.comment) lines.push('', `Комментарий: ${data.comment}`);
  lines.push('', 'С любовью и благодарностью ♥');
  const message = lines.join('\n');
  dom.messagePreview.value = message;
  return message;
}

function showStatus(node) {
  [dom.copyStatus, dom.saveStatus, dom.errorStatus, dom.submitStatus].forEach((item) => item.classList.add('hidden'));
  node.classList.remove('hidden');
  setTimeout(() => node.classList.add('hidden'), 2600);
}

function shareTelegram() {
  if (!validateForm()) return;
  const url = `https://t.me/share/url?url=&text=${encodeURIComponent(buildMessage())}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

async function copyMessage() {
  if (!validateForm()) return;
  const message = buildMessage();
  try {
    await navigator.clipboard.writeText(message);
  } catch (error) {
    dom.messagePreview.focus();
    dom.messagePreview.select();
    document.execCommand('copy');
  }
  showStatus(dom.copyStatus);
}

function saveDraft() {
  const payload = {
    guestName: dom.guestName.value,
    guestPhone: dom.guestPhone.value,
    guestCount: dom.guestCount.value,
    attendance: dom.attendance.value,
    guestMessage: dom.guestMessage.value
  };
  localStorage.setItem('invite-rsvp-draft', JSON.stringify(payload));
}

function saveDraftStatus() {
  saveDraft();
  showStatus(dom.saveStatus);
}

function loadDraft() {
  const raw = localStorage.getItem('invite-rsvp-draft');
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    dom.guestName.value = data.guestName || '';
    dom.guestPhone.value = data.guestPhone || '';
    dom.guestCount.value = data.guestCount || '1';
    dom.attendance.value = data.attendance || 'С радостью буду';
    dom.guestMessage.value = data.guestMessage || '';
  } catch (error) {}
}

function resetForm() {
  dom.guestName.value = '';
  dom.guestPhone.value = '';
  dom.guestCount.value = '1';
  dom.attendance.value = 'С радостью буду';
  dom.guestMessage.value = '';
  localStorage.removeItem('invite-rsvp-draft');
  buildMessage();
}

async function submitRsvp() {
  if (!validateForm()) return;
  const payload = {
    ...getFormData(),
    event: RSVP_CONFIG.event.celebrant,
    eventDate: RSVP_CONFIG.event.date,
    eventTime: RSVP_CONFIG.event.time,
    venue: RSVP_CONFIG.event.place,
    message: buildMessage()
  };
  try {
    const response = await fetch(RSVP_CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('submit failed');
    showStatus(dom.submitStatus);
  } catch (error) {
    alert('Не удалось отправить RSVP. Проверь настройки Telegram Bot и deploy.');
  }
}

init();
