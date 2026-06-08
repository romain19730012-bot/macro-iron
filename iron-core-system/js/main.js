// Menu mobile
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger?.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Fermer le menu au clic sur un lien
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

// Lien actif selon la section visible
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navItems.forEach(a => a.classList.remove('active'));
      const link = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (link) link.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(section => sectionObserver.observe(section));

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.style.background = 'rgba(6, 7, 11, 0.99)';
    navbar.style.boxShadow = '0 4px 30px rgba(0,0,0,0.5)';
  } else {
    navbar.style.background = 'rgba(6, 7, 11, 0.96)';
    navbar.style.boxShadow = 'none';
  }
});

// Scroll reveal
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, (entry.target.dataset.delay || 0));
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '-40px' });

// Décalage pour les grilles
document.querySelectorAll('.features .reveal, .stats .reveal, .blog-grid .reveal').forEach((el, i) => {
  el.dataset.delay = i * 100;
});

revealElements.forEach(el => revealObserver.observe(el));

// Contact form
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.btn-submit');
  const original = btn.textContent;
  btn.textContent = 'Message Envoyé ✓';
  btn.style.background = '#1a6b2a';
  setTimeout(() => {
    btn.textContent = original;
    btn.style.background = '';
    e.target.reset();
  }, 3000);
}

// Compteur animé pour les stats
const statNums = document.querySelectorAll('.stat-num');

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statNums.forEach(el => counterObserver.observe(el));

function animateCounter(el) {
  const text = el.textContent;
  const match = text.match(/[\d\s]+/);
  if (!match) return;
  const raw = match[0].replace(/\s/g, '');
  const target = parseInt(raw);
  if (isNaN(target)) return;
  const prefix = text.includes('+') ? '+' : '';
  const suffix = text.replace(/[+\d\s]/g, '');
  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    const formatted = current >= 1000
      ? current.toLocaleString('fr-FR').replace(',', ' ')
      : current;
    el.textContent = prefix + formatted + (suffix ? ' ' + suffix : '');
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}
