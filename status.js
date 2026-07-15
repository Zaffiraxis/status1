// Nav background on scroll
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Scroll-reveal — base state is visible; only arm the hide/reveal in a
// painting browser (double rAF actually fires). Non-painting capture
// contexts skip arming and show final content.
const reveals = Array.from(document.querySelectorAll('.reveal-up'));
function revealCheck() {
  const vh = window.innerHeight || document.documentElement.clientHeight;
  for (let i = reveals.length - 1; i >= 0; i--) {
    const el = reveals[i];
    const r = el.getBoundingClientRect();
    if (r.top < vh * 0.9 && r.bottom > 0) {
      el.classList.add('in');
      reveals.splice(i, 1);
    }
  }
}
requestAnimationFrame(() => requestAnimationFrame(() => {
  document.documentElement.classList.add('reveal-on');
  revealCheck();
  window.addEventListener('scroll', revealCheck, { passive: true });
  window.addEventListener('resize', revealCheck);
  // Failsafe: never leave content hidden
  setTimeout(() => document.querySelectorAll('.reveal-up').forEach((el) => el.classList.add('in')), 3000);
}));

// About gallery — fade slider with prev/next + dots
(() => {
  const gallery = document.getElementById('about-gallery');
  if (!gallery) return;
  const slides = Array.from(gallery.querySelectorAll('.about-slide'));
  const dots = Array.from(document.querySelectorAll('#about-dots button'));
  let i = 0, timer;
  function show(n) {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle('is-active', idx === i));
    dots.forEach((d, idx) => d.classList.toggle('is-active', idx === i));
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(() => show(i + 1), 5000);
  }
  document.getElementById('about-prev').addEventListener('click', () => { show(i - 1); restart(); });
  document.getElementById('about-next').addEventListener('click', () => { show(i + 1); restart(); });
  dots.forEach((d, idx) => d.addEventListener('click', () => { show(idx); restart(); }));
  restart();
})();

// Certificates — two rows, auto-scrolling in opposite directions,
// pause on manual touch/wheel interaction, click a cert to open it fullscreen
function wireCertRow(track, direction) {
  if (!track) return;
  const step = () => (track.querySelector('.cert-card')?.offsetWidth || 220) + 20;
  const atEnd = () => track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  const atStart = () => track.scrollLeft <= 4;

  let timer;
  function autoAdvance() {
    if (direction === 1) {
      if (atEnd()) track.scrollTo({ left: 0, behavior: 'smooth' });
      else track.scrollBy({ left: step(), behavior: 'smooth' });
    } else {
      if (atStart()) track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
      else track.scrollBy({ left: -step(), behavior: 'smooth' });
    }
  }
  function startAuto() {
    clearInterval(timer);
    timer = setInterval(autoAdvance, 2300);
  }
  function pauseAuto() {
    clearInterval(timer);
    clearTimeout(pauseAuto._resume);
    pauseAuto._resume = setTimeout(startAuto, 6000);
  }

  if (direction === -1) track.scrollLeft = track.scrollWidth;
  track.addEventListener('touchstart', pauseAuto, { passive: true });
  track.addEventListener('wheel', pauseAuto, { passive: true });
  startAuto();
}
wireCertRow(document.getElementById('cert-track-1'), 1);
wireCertRow(document.getElementById('cert-track-2'), -1);

// Certificate fullscreen modal
(() => {
  const modal = document.getElementById('cert-modal');
  const modalImg = document.getElementById('cert-modal-img');
  const closeBtn = document.getElementById('cert-modal-close');
  if (!modal || !modalImg || !closeBtn) return;
  function open(src, alt) {
    modalImg.src = src;
    modalImg.alt = alt;
    modal.classList.add('open');
  }
  function close() {
    modal.classList.remove('open');
    modalImg.src = '';
  }
  document.querySelectorAll('.cert-card img, .doc-avatar').forEach((img) => {
    img.addEventListener('click', () => open(img.src, img.alt));
  });
  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();

// Cases ribbons — real Cloudinary before/intermediate/after photos, built into cards
const CASE_PHOTO_BASE = 'https://res.cloudinary.com/detvp6scw/image/upload/f_auto,q_auto,w_1600/bella-dent/cases/';
const CASES = [
  { id: '01', name: null, shots: ['before', 'after'] },
  { id: '02', name: null, shots: ['before', 'intermediate', 'after'] },
  { id: '03', name: null, shots: ['before', 'after'] },
  { id: '04', name: null, shots: ['before', 'after'] },
  { id: '05', name: null, shots: ['before', 'after'] },
  { id: '06', name: 'Протезування беззубої щелепи', shots: ['before', 'intermediate', 'after'] },
  { id: '07', name: 'Раннє лікування мезіального прикусу', shots: ['before', 'after'] },
  { id: '08', name: 'Вініри', shots: ['before', 'after'] },
  { id: '09', name: 'Вініри', shots: ['before', 'after'] },
  { id: '10', name: 'Вініри', shots: ['before', 'after'] },
  { id: '11', name: 'Вініри', shots: ['before', 'after'] },
  { id: '12', name: 'Вініри', shots: ['before', 'after'] },
  { id: '13', name: 'Вініри', shots: ['before', 'after'] },
];
const CASE_SHOT_LABEL = { before: 'До', intermediate: 'Проміжний результат', after: 'Після' };

function buildCaseCard(c, hidden) {
  const card = document.createElement('article');
  card.className = 'case-card';
  if (hidden) card.setAttribute('aria-hidden', 'true');
  c.shots.forEach((shot) => {
    const el = document.createElement('div');
    el.className = 'case-shot';
    el.style.backgroundImage = `url("${CASE_PHOTO_BASE}case-${c.id}-${shot}.png")`;
    const tag = document.createElement('span');
    tag.className = 'case-tag';
    tag.textContent = CASE_SHOT_LABEL[shot];
    el.appendChild(tag);
    card.appendChild(el);
  });
  if (c.name) {
    const chip = document.createElement('div');
    chip.className = 'case-chip';
    chip.textContent = c.name;
    card.appendChild(chip);
  }
  return card;
}

function fillCaseTrack(trackId, cases) {
  const track = document.getElementById(trackId);
  if (!track) return;
  cases.forEach((c) => track.appendChild(buildCaseCard(c, false)));
  // duplicate once so the CSS marquee (translateX(-50%)) loops seamlessly
  cases.forEach((c) => track.appendChild(buildCaseCard(c, true)));
}
fillCaseTrack('case-track-1', CASES.filter((_, i) => i % 2 === 0));
fillCaseTrack('case-track-2', CASES.filter((_, i) => i % 2 === 1));

// Cases ribbons — CSS-driven marquee; pause on touch since :hover doesn't fire there
function wireCaseRibbon(ribbonId, trackId) {
  const ribbon = document.getElementById(ribbonId);
  const track = document.getElementById(trackId);
  if (!ribbon || !track) return;
  let resumeTimer;
  const pause = () => {
    track.classList.add('paused');
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => track.classList.remove('paused'), 4000);
  };
  ribbon.addEventListener('touchstart', pause, { passive: true });
}
wireCaseRibbon('case-ribbon-1', 'case-track-1');
wireCaseRibbon('case-ribbon-2', 'case-track-2');

// Mobile menu
const burger = document.getElementById('nav-burger');
const mobile = document.getElementById('nav-mobile');
burger.addEventListener('click', () => {
  const open = burger.classList.toggle('open');
  mobile.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
});
mobile.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
  burger.classList.remove('open');
  mobile.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
}));

// Appointment forms — appt-form on index.html, price-form on price.html
function wireLeadForm(formEl, noteEl) {
  if (!formEl) return;
  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = formEl.name.value.trim();
    const phone = formEl.phone.value.trim();
    if (!name || !phone) {
      [formEl.name, formEl.phone].forEach((f) => {
        if (!f.value.trim()) {
          f.style.borderColor = '#ffd1d1';
          f.addEventListener('input', () => { f.style.borderColor = ''; }, { once: true });
        }
      });
      return;
    }
    noteEl.hidden = false;
    formEl.querySelector('button[type="submit"]').textContent = 'Заявку надіслано ✓';
    setTimeout(() => { formEl.reset(); }, 300);
  });
}
wireLeadForm(document.getElementById('appt-form'), document.getElementById('form-note'));
wireLeadForm(document.getElementById('price-form'), document.getElementById('price-form-note'));

// Scroll-spy — highlight the nav link for the section currently in view
(() => {
  const sections = Array.from(document.querySelectorAll('main > section[id]'));
  const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"], .nav-mobile a[href^="#"]'));
  if (!sections.length || !navLinks.length) return;
  const linkFor = (id) => navLinks.filter((a) => a.getAttribute('href') === `#${id}`);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.classList.remove('active'));
      linkFor(entry.target.id).forEach((a) => a.classList.add('active'));
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
  sections.forEach((s) => observer.observe(s));
})();

// Back-to-top button (price.html)
(() => {
  const btn = document.getElementById('to-top');
  if (!btn) return;
  const onScroll = () => btn.classList.toggle('show', window.scrollY > 500);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();
