/* ============================================================
   SYMMBIOTE — interaction layer
   ============================================================ */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 1. Synapse network (living background) ---------- */
(function synapse() {
  const canvas = document.getElementById('synapse');
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext('2d');

  let w, h, nodes, dpr;
  const mouse = { x: -9999, y: -9999 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    const count = Math.min(90, Math.floor((innerWidth * innerHeight) / 18000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.18 * dpr,
      vy: (Math.random() - 0.5) * 0.18 * dpr,
    }));
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    const linkDist = 130 * dpr;
    const mr = 170 * dpr;

    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;

      // gentle pull toward cursor
      const dx = mouse.x - n.x, dy = mouse.y - n.y;
      const d = Math.hypot(dx, dy);
      if (d < mr) {
        n.x += (dx / d) * 0.4;
        n.y += (dy / d) * 0.4;
      }
    }

    // connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < linkDist) {
          const alpha = (1 - dist / linkDist) * 0.4;
          ctx.strokeStyle = `rgba(166, 255, 46, ${alpha})`;
          ctx.lineWidth = dpr * 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // nodes
    for (const n of nodes) {
      const near = Math.hypot(mouse.x - n.x, mouse.y - n.y) < mr;
      ctx.beginPath();
      ctx.arc(n.x, n.y, dpr * (near ? 2.4 : 1.5), 0, Math.PI * 2);
      ctx.fillStyle = near ? 'rgba(56, 232, 200, 0.9)' : 'rgba(166, 255, 46, 0.55)';
      ctx.fill();
    }

    requestAnimationFrame(tick);
  }

  addEventListener('resize', resize);
  addEventListener('mousemove', (e) => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; });
  addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });
  resize();
  tick();
})();

/* ---------- 2. Boot terminal typing ---------- */
(function terminal() {
  const el = document.getElementById('terminal');
  if (!el) return;

  const lines = [
    { t: '> Supervisor initialized…', c: 'prompt' },
    { t: '> Loading company context…', c: 'prompt' },
    { t: '> Memory systems online', c: 'prompt' },
    { t: '> Routing task → Lead Generation', c: 'prompt' },
    { t: '> Retrieving workflow knowledge…', c: 'prompt' },
    { t: '> Human approval required for outreach', c: 'prompt' },
    { t: '✓ Symmbiote ready.', c: 'ok' },
  ];

  if (reduceMotion) {
    el.innerHTML = lines.map(l => `<span class="ln ${l.c}">${l.t}</span>`).join('');
    return;
  }

  let li = 0, ci = 0;
  const cursor = '<span class="cursor"></span>';

  function type() {
    const built = lines.slice(0, li).map(l => `<span class="ln ${l.c}">${l.t}</span>`).join('');
    if (li >= lines.length) { el.innerHTML = built + cursor; return; }
    const cur = lines[li];
    const partial = cur.t.slice(0, ci);
    el.innerHTML = built + `<span class="ln ${cur.c}">${partial}${cursor}</span>`;
    if (ci < cur.t.length) { ci++; setTimeout(type, 18 + Math.random() * 30); }
    else { li++; ci = 0; setTimeout(type, 320); }
  }

  // start when card scrolls into view
  const io = new IntersectionObserver((entries, obs) => {
    if (entries[0].isIntersecting) { type(); obs.disconnect(); }
  }, { threshold: 0.3 });
  io.observe(el);
})();

/* ---------- 3. Scroll reveals ---------- */
(function reveals() {
  const items = document.querySelectorAll('[data-reveal]');
  if (reduceMotion) { items.forEach(i => i.classList.add('in')); return; }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        const siblings = [...e.target.parentElement.querySelectorAll('[data-reveal]')];
        const idx = siblings.indexOf(e.target);
        e.target.style.transitionDelay = `${Math.max(0, idx) * 70}ms`;
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  items.forEach(i => io.observe(i));
})();

/* ---------- 4. Counter (100%) ---------- */
(function counter() {
  const el = document.querySelector('[data-count]');
  if (!el) return;
  const target = +el.dataset.count;
  const suffix = el.dataset.suffix || '';

  function run() {
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const dur = 1100;
    const start = performance.now();
    (function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  const io = new IntersectionObserver((entries, obs) => {
    if (entries[0].isIntersecting) { run(); obs.disconnect(); }
  }, { threshold: 0.6 });
  io.observe(el);
})();

/* ---------- 4b. Roadmap timeline scroll-fill ---------- */
(function timeline() {
  const tl = document.getElementById('timeline');
  const fill = document.getElementById('timelineFill');
  if (!tl || !fill) return;

  const items = [...tl.querySelectorAll('.tl-item')];

  if (reduceMotion) {
    fill.style.height = '100%';
    items.forEach(i => i.classList.add('reached'));
    return;
  }

  function update() {
    const rect = tl.getBoundingClientRect();
    const total = tl.offsetHeight;
    const maxFill = Math.max(0, total - 16);          // line spans top:8 → bottom:8
    const trigger = window.innerHeight * 0.62;        // fill follows a line 62% down the viewport

    let filled = trigger - rect.top - 8;
    filled = Math.max(0, Math.min(maxFill, filled));
    fill.style.height = filled + 'px';

    items.forEach((it) => {
      const node = it.querySelector('.tl-node');
      const center = node.offsetTop + node.offsetHeight / 2 - 8;
      it.classList.toggle('reached', filled >= center);
    });
  }

  update();
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
})();

/* ---------- 5. Nav background on scroll ---------- */
(function navState() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 24);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });
})();

/* ---------- 6. Waitlist form ---------- */
(function waitlist() {
  const form = document.getElementById('waitlistForm');
  const success = document.getElementById('successMessage');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    console.log('Waitlist signup:', email);
    success.classList.add('show');
    form.reset();
  });
})();
