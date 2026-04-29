/* FZD Global — shared site behavior:
   - Mobile menu toggle
   - Scroll reveal observer
   - Animated number counters
   - Year stamp
*/
(function() {
  'use strict';

  // Mobile nav
  document.addEventListener('click', function(e) {
    const t = e.target.closest('[data-menu-toggle]');
    if (t) {
      const open = document.body.classList.toggle('menu-open');
      t.setAttribute('aria-expanded', open);
      return;
    }
    // Close menu when a nav link is clicked
    if (e.target.closest('.nav a') && document.body.classList.contains('menu-open')) {
      document.body.classList.remove('menu-open');
      const toggle = document.querySelector('[data-menu-toggle]');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  function bindReveals() {
    document.querySelectorAll('.reveal').forEach(el => {
      if (!el.classList.contains('in') && !el.dataset.observed) {
        el.dataset.observed = '1';
        io.observe(el);
      }
    });
  }
  bindReveals();
  // re-bind after lang swap (in case content changed)
  window.addEventListener('fzd:langchange', bindReveals);

  // Animated counters
  function animateCounter(el) {
    const raw = (el.textContent || '').trim();
    const match = raw.match(/^(\D*)([\d.,]+)(\D*)$/);
    if (!match) return;
    const prefix = match[1];
    const numStr = match[2];
    const suffix = match[3];
    const target = parseFloat(numStr.replace(/,/g, ''));
    if (isNaN(target)) return;
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = target * eased;
      const display = target >= 100 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, '');
      el.textContent = prefix + display + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = raw;
    }
    requestAnimationFrame(tick);
  }
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-counter]').forEach(el => counterIO.observe(el));

  // Lang switch buttons
  document.addEventListener('click', function(e) {
    const b = e.target.closest('[data-lang-btn]');
    if (!b) return;
    window.FZD_setLang(b.getAttribute('data-lang-btn'));
  });

  // Year
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
})();
