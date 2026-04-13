/* ══ FORMIXA STUDIO — animations.js ══ */

// ── 1. NAV SCROLL SHRINK ──────────────────
(function() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ── 2. HAMBURGER + MOBILE NAV ─────────────
(function() {
  const btn = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    links.classList.toggle('open', open);
    document.body.classList.toggle('nav-open', open);
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      links.classList.remove('open');
      document.body.classList.remove('nav-open');
    });
  });
})();

// ── 3. CUSTOM CURSOR ─────────────────────
(function() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.className  = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mx = -100, my = -100, rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
  });

  // Ring follows with lerp
  (function lerp() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(lerp);
  })();

  // Hover effect
  document.querySelectorAll('a, button, [role="button"], .work-card, .service-card, .value-card, .pricing-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
  });

  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
})();

// ── 4. SCROLL REVEAL ─────────────────────
(function() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => io.observe(el));
})();

// ── 5. STAGGER CHILDREN (auto) ───────────
(function() {
  document.querySelectorAll('[data-stagger]').forEach(parent => {
    const delay = parseFloat(parent.dataset.stagger) || 0.1;
    parent.querySelectorAll(':scope > *').forEach((child, i) => {
      child.classList.add('reveal');
      child.style.transitionDelay = (i * delay) + 's';
    });
  });
})();

// ── 6. FAQ ACCORDION ─────────────────────
(function() {
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item   = q.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
})();

// ── 7. STAT COUNTER ANIMATION ────────────
(function() {
  function animateCount(el) {
    const txt = el.textContent;
    const num = parseFloat(txt.replace(/[^0-9.]/g, ''));
    if (isNaN(num) || num === 0 || txt === '∞' || txt === '2026') return;

    const isDecimal = txt.includes('.');
    const suffix    = txt.replace(/[0-9.]/g, '');
    const duration  = 1400;
    const start     = performance.now();

    const update = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // ease-out-cubic
      const val  = num * ease;
      el.textContent = (isDecimal ? val.toFixed(2) : Math.round(val)) + suffix;
      if (t < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCount(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-num').forEach(el => io.observe(el));
})();

// ── 8. TILT ON CARDS (subtle, desktop) ───
(function() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  document.querySelectorAll('.service-card, .pricing-card, .value-card, .work-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 6;
      const y = ((e.clientY - r.top)  / r.height - 0.5) * 6;
      card.style.transform = `translateY(-5px) rotateX(${-y}deg) rotateY(${x}deg)`;
      card.style.transition = 'transform 0.1s';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1)';
    });
  });
})();

// ── 9. SMOOTH PAGE LINKS ─────────────────
(function() {
  // Tiny page transition flash
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('http') || a.target === '_blank') return;
    a.addEventListener('click', e => {
      // Just a subtle opacity flash, no blocking
      document.body.style.opacity = '0.85';
      document.body.style.transition = 'opacity 0.15s';
      setTimeout(() => { document.body.style.opacity = ''; }, 300);
    });
  });
  // Restore on load
  window.addEventListener('pageshow', () => {
    document.body.style.opacity = '1';
    document.body.style.transition = 'opacity 0.2s';
    setTimeout(() => { document.body.style.transition = ''; }, 200);
  });
})();
