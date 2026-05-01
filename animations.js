/* ══ FORMIXA STUDIO — animations.js v2 ══ */
'use strict';

// ── 1. NAV SCROLL SHRINK ──────────────────────────────────────
(function () {
  const nav = document.querySelector('nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ── 2. HAMBURGER + MOBILE NAV ─────────────────────────────────
(function () {
  const btn   = document.getElementById('hamburger');
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

// ── 3. CUSTOM CURSOR (desktop) ────────────────────────────────
(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.className  = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mx = -200, my = -200;
  let rx = -200, ry = -200;
  let isDown = false;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  document.addEventListener('mousedown', () => {
    isDown = true;
    ring.classList.add('clicking');
    ring.classList.remove('hovering');
  });
  document.addEventListener('mouseup', () => {
    isDown = false;
    ring.classList.remove('clicking');
  });

  // Lerp ring
  let rafId;
  (function lerp() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    rafId = requestAnimationFrame(lerp);
  })();

  function attachHover() {
    document.querySelectorAll(
      'a, button, [role="button"], .work-card, .service-card, .value-card, .pricing-card, .service-full-card, .team-card, .stat, .timeline-item, .contact-detail'
    ).forEach(el => {
      if (el._hoverAttached) return;
      el._hoverAttached = true;
      el.addEventListener('mouseenter', () => { if (!isDown) ring.classList.add('hovering'); });
      el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
    });
  }
  attachHover();

  const obs = new MutationObserver(attachHover);
  obs.observe(document.body, { childList: true, subtree: true });

  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
})();

// ── 4. SCROLL REVEAL ─────────────────────────────────────────
(function () {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.06 });

  function observeAll() {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
      if (!el._revealObserved) { el._revealObserved = true; io.observe(el); }
    });
  }
  observeAll();
  setTimeout(observeAll, 60);
})();

// ── 5. STAGGER CHILDREN ──────────────────────────────────────
(function () {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.05 });

  document.querySelectorAll('[data-stagger]').forEach(parent => {
    const delay = parseFloat(parent.dataset.stagger) || 0.1;
    parent.querySelectorAll(':scope > *').forEach((child, i) => {
      child.classList.add('reveal');
      child.style.transitionDelay = (i * delay) + 's';
      io.observe(child);
    });
  });
})();

// ── 6. FAQ ACCORDION ─────────────────────────────────────────
(function () {
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item   = q.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
})();

// ── 7. STAT COUNTER ANIMATION ────────────────────────────────
(function () {
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCount(el) {
    const txt = el.textContent;
    if (txt === '∞' || txt === '2026') return;
    const num = parseFloat(txt.replace(/[^0-9.]/g, ''));
    if (isNaN(num) || num === 0) return;

    const isDecimal = txt.includes('.');
    const suffix    = txt.replace(/[0-9.]/g, '');
    const duration  = 1600;
    const start     = performance.now();

    const update = now => {
      const t    = Math.min((now - start) / duration, 1);
      const ease = easeOutCubic(t);
      const val  = num * ease;
      el.textContent = (isDecimal ? val.toFixed(2) : Math.round(val)) + suffix;
      if (t < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCount(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-num').forEach(el => io.observe(el));
})();

// ── 8. 3D CARD TILT (desktop, subtle) ────────────────────────
(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const selector = '.service-card, .pricing-card, .value-card, .work-card, .service-full-card';

  function attachTilt() {
    document.querySelectorAll(selector).forEach(card => {
      if (card._tiltAttached) return;
      card._tiltAttached = true;

      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width  - 0.5) * 7;
        const y = ((e.clientY - r.top)  / r.height - 0.5) * 7;
        card.style.transform = `translateY(-5px) rotateX(${-y}deg) rotateY(${x}deg)`;
        card.style.transition = 'transform 0.08s';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
      });
    });
  }
  attachTilt();
  new MutationObserver(attachTilt).observe(document.body, { childList: true, subtree: true });
})();

// ── 9. MAGNETIC BUTTONS ──────────────────────────────────────
(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  function attachMagnetic() {
    document.querySelectorAll('.btn-primary, .nav-cta').forEach(btn => {
      if (btn._magneticAttached) return;
      btn._magneticAttached = true;

      btn.addEventListener('mousemove', e => {
        const r    = btn.getBoundingClientRect();
        const cx   = r.left + r.width  / 2;
        const cy   = r.top  + r.height / 2;
        const dx   = (e.clientX - cx) * 0.28;
        const dy   = (e.clientY - cy) * 0.28;
        btn.style.transform   = `translate(${dx}px, ${dy}px)`;
        btn.style.transition  = 'transform 0.15s';
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform  = '';
        btn.style.transition = 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1)';
      });
    });
  }
  attachMagnetic();
  new MutationObserver(attachMagnetic).observe(document.body, { childList: true, subtree: true });
})();

// ── 10. HERO PARALLAX ─────────────────────────────────────────
(function () {
  const blobs = document.querySelectorAll('.blob');
  const geo   = document.querySelector('.hero-geo');
  if (!blobs.length && !geo) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      blobs.forEach((b, i) => {
        const speed = (i + 1) * 0.06;
        b.style.transform = `translateY(${y * speed}px)`;
      });
      if (geo) geo.style.transform = `translateY(${y * 0.04}px)`;
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
})();

// ── 11. SMOOTH PAGE TRANSITIONS ──────────────────────────────
(function () {
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('http') || a.target === '_blank') return;
    a.addEventListener('click', () => {
      document.body.style.opacity = '0.8';
      document.body.style.transition = 'opacity 0.18s';
      setTimeout(() => { document.body.style.opacity = ''; }, 320);
    });
  });
  window.addEventListener('pageshow', () => {
    document.body.style.opacity = '1';
    document.body.style.transition = 'opacity 0.22s';
    setTimeout(() => { document.body.style.transition = ''; }, 250);
  });
})();

// ── 12. FORCE-SHOW ABOVE-FOLD ELEMENTS ───────────────────────
(function () {
  function forceVisible() {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('visible');
    });
  }
  forceVisible();
  setTimeout(forceVisible, 80);
  setTimeout(forceVisible, 380);
})();

// ── 13. GLOWING BORDER ON HOVER (service/value cards) ────────
(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  function attachGlow() {
    document.querySelectorAll('.service-full-card, .value-card, .pricing-card').forEach(card => {
      if (card._glowAttached) return;
      card._glowAttached = true;

      card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const x  = ((e.clientX - r.left) / r.width)  * 100;
        const y  = ((e.clientY - r.top)  / r.height) * 100;
        card.style.setProperty('--gx', x + '%');
        card.style.setProperty('--gy', y + '%');
        card.style.backgroundImage =
          `radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), rgba(56,189,248,0.055) 0%, transparent 55%),
           rgba(255,255,255,0.025)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.backgroundImage = '';
      });
    });
  }
  attachGlow();
  new MutationObserver(attachGlow).observe(document.body, { childList: true, subtree: true });
})();

// ── 14. SCROLL PROGRESS BAR ───────────────────────────────────
(function () {
  const bar = document.createElement('div');
  bar.style.cssText =
    'position:fixed;top:0;left:0;height:2px;z-index:9999;pointer-events:none;' +
    'background:linear-gradient(90deg,#0ea5e9,#6366f1);width:0%;transition:width 0.1s;';
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });
})();
