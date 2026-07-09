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

// Certificates carousel — scroll by one card width per click
(() => {
  const track = document.getElementById('cert-track');
  const prev = document.getElementById('cert-prev');
  const next = document.getElementById('cert-next');
  if (!track || !prev || !next) return;
  const step = () => (track.querySelector('.cert-card')?.offsetWidth || 220) + 20;
  prev.addEventListener('click', () => track.scrollBy({ left: -step() * 2, behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step() * 2, behavior: 'smooth' }));
})();

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

// Appointment form (only present on index.html)
const form = document.getElementById('appt-form');
const note = document.getElementById('form-note');
if (form) form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = form.name.value.trim();
  const phone = form.phone.value.trim();
  if (!name || !phone) {
    [form.name, form.phone].forEach((f) => {
      if (!f.value.trim()) {
        f.style.borderColor = '#ffd1d1';
        f.addEventListener('input', () => { f.style.borderColor = ''; }, { once: true });
      }
    });
    return;
  }
  note.hidden = false;
  form.querySelector('button[type="submit"]').textContent = 'Заявку надіслано ✓';
  setTimeout(() => { form.reset(); }, 300);
});
