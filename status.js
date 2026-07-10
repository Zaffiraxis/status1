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

// Certificates carousel — scroll by one card width per click, auto-advances,
// pauses on manual interaction (touch/wheel/nav clicks)
(() => {
  const track = document.getElementById('cert-track');
  const prev = document.getElementById('cert-prev');
  const next = document.getElementById('cert-next');
  if (!track || !prev || !next) return;
  const step = () => (track.querySelector('.cert-card')?.offsetWidth || 220) + 20;
  const atEnd = () => track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;

  let timer;
  function autoAdvance() {
    if (atEnd()) track.scrollTo({ left: 0, behavior: 'smooth' });
    else track.scrollBy({ left: step(), behavior: 'smooth' });
  }
  function startAuto() {
    clearInterval(timer);
    timer = setInterval(autoAdvance, 3200);
  }
  function pauseAuto() {
    clearInterval(timer);
    clearTimeout(pauseAuto._resume);
    pauseAuto._resume = setTimeout(startAuto, 6000);
  }

  prev.addEventListener('click', () => { track.scrollBy({ left: -step() * 2, behavior: 'smooth' }); pauseAuto(); });
  next.addEventListener('click', () => { track.scrollBy({ left: step() * 2, behavior: 'smooth' }); pauseAuto(); });
  track.addEventListener('touchstart', pauseAuto, { passive: true });
  track.addEventListener('wheel', pauseAuto, { passive: true });
  startAuto();
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
