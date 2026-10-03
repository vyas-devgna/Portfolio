/* Devgna Vyas — portfolio interactions.
   Progressive: every section reads fine without this file; GSAP/Lenis are optional upgrades. */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const media = (q) => window.matchMedia(q);
  const reduced = media('(prefers-reduced-motion: reduce)').matches;
  const fine = media('(hover: hover) and (pointer: fine)').matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  const motion = Boolean(gsap && ST) && !reduced;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const EMAIL = 'vyasdevgna@gmail.com';
  const tap = (ms = 8) => { if (!reduced && navigator.vibrate) navigator.vibrate(ms); };

  if (gsap) gsap.registerPlugin(...[ST, window.SplitText].filter(Boolean));

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 0.95 });
    lenis.on('scroll', ST.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const lockScroll = (on) => {
    if (lenis) on ? lenis.stop() : lenis.start();
    document.body.style.overflow = on ? 'hidden' : '';
  };
  const closeDialog = (d) => { if (d.open) d.close(); lockScroll(false); };

  const scrollToTarget = (target, instant = false) => {
    if (!target) return;
    const y = target.id === 'home' ? 0 : target;
    if (lenis) lenis.scrollTo(y, { duration: instant ? 0 : 1.4, immediate: instant, offset: target.id === 'home' ? 0 : -8 });
    else if (target.id === 'home') window.scrollTo({ top: 0, behavior: instant || reduced ? 'auto' : 'smooth' });
    else target.scrollIntoView({ behavior: instant || reduced ? 'auto' : 'smooth' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').length < 2) return;
    const target = document.getElementById(a.getAttribute('href').slice(1));
    if (!target) return;
    e.preventDefault();
    closeMenu();
    scrollToTarget(target);
    history.replaceState(null, '', a.getAttribute('href') === '#home' ? location.pathname : a.getAttribute('href'));
  });

  /* ---------- toast + clipboard ---------- */
  const toastEl = $('.toast');
  let toastTimer = 0;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2200);
  };
  const copyEmail = async (e) => {
    const btn = e && e.currentTarget && e.currentTarget.dataset ? e.currentTarget : null;
    try { await navigator.clipboard.writeText(EMAIL); tap(12); }
    catch { toast(EMAIL); return; }
    if (!btn) { toast('Email copied ✓'); return; }
    btn.classList.add('is-copied');
    clearTimeout(btn._t);
    btn._t = setTimeout(() => btn.classList.remove('is-copied'), 1800);
  };
  $$('[data-copy]').forEach((b) => b.addEventListener('click', copyEmail));

  /* ---------- theme ---------- */
  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : media('(prefers-color-scheme: dark)').matches;
  const themeListeners = [];
  const setTheme = (dark) => {
    root.dataset.theme = dark ? 'dark' : 'light';
    try { localStorage.setItem('theme', root.dataset.theme); } catch {}
    $$('meta[name="theme-color"]').forEach((m) => { m.content = dark ? '#0d0e0c' : '#f2f0ea'; });
    themeListeners.forEach((fn) => fn());
  };
  const toggleTheme = (e) => {
    const apply = () => setTheme(!isDark());
    const src = e && e.currentTarget && e.currentTarget.getBoundingClientRect ? e.currentTarget.getBoundingClientRect() : null;
    root.style.setProperty('--vx', src ? `${src.left + src.width / 2}px` : '50%');
    root.style.setProperty('--vy', src ? `${src.top + src.height / 2}px` : '0px');
    if (document.startViewTransition && !reduced) document.startViewTransition(apply);
    else apply();
    tap();
  };
  $$('[data-theme-toggle]').forEach((b) => b.addEventListener('click', toggleTheme));
  media('(prefers-color-scheme: dark)').addEventListener('change', () => themeListeners.forEach((fn) => fn()));

  /* ---------- header: hide on scroll down, progress, active section ---------- */
  const topbar = $('.topbar');
  const bar = $('.progress i');
  let lastY = window.scrollY;
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    topbar.classList.toggle('is-scrolled', y > 24);
    if (!document.body.classList.contains('menu-open') && !topbar.contains(document.activeElement)) {
      if (y > lastY + 4 && y > 420) topbar.classList.add('is-hidden');
      else if (y < lastY - 4) topbar.classList.remove('is-hidden');
    }
    lastY = y;
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  topbar.addEventListener('focusin', () => topbar.classList.remove('is-hidden'));
  onScroll();

  const nav = $('.nav');
  const pill = $('.nav-pill');
  const navLinks = $$('.nav a');
  let activeLink = null;
  const movePill = (link) => {
    if (!link) { pill.style.opacity = '0'; return; }
    pill.style.opacity = '1';
    pill.style.width = `${link.offsetWidth}px`;
    pill.style.transform = `translateX(${link.offsetLeft}px)`;
  };
  window.addEventListener('resize', () => movePill(activeLink), { passive: true });
  if (document.fonts) document.fonts.ready.then(() => movePill(activeLink));
  navLinks.forEach((l) => l.addEventListener('pointerenter', () => movePill(l)));
  nav.addEventListener('pointerleave', () => movePill(activeLink));
  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      activeLink = navLinks.find((l) => l.hash === `#${entry.target.id}`) || null;
      navLinks.forEach((l) => l.classList.toggle('is-active', l === activeLink));
      navLinks.forEach((l) => (l === activeLink ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current')));
      movePill(activeLink);
    });
  }, { rootMargin: '-45% 0px -50%' });
  $$('main > section[id]').forEach((s) => sectionObs.observe(s));

  /* ---------- mobile menu ---------- */
  const menu = $('#menu');
  const menuBtn = $('.menu-btn');
  function closeMenu() {
    if (!menu || menu.hidden) return;
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.querySelector('span').textContent = 'Menu';
    menu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    lockScroll(false);
    setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, reduced ? 0 : 800);
  }
  const openMenu = () => {
    menu.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.querySelector('span').textContent = 'Close';
    document.body.classList.add('menu-open');
    lockScroll(true);
    requestAnimationFrame(() => menu.classList.add('is-open'));
    if (motion) gsap.fromTo($$('nav a', menu), { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.05, delay: 0.18 });
    $('nav a', menu).focus({ preventScroll: true });
  };
  menuBtn.addEventListener('click', () => (menuBtn.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu()));
  menu.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const items = [...$$('a', menu), menuBtn];
    const i = items.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); items.at(-1).focus(); }
    else if (!e.shiftKey && i === items.length - 2) { e.preventDefault(); menuBtn.focus(); }
  });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { closeMenu(); menuBtn.focus(); } });
  media('(min-width: 1081px)').addEventListener('change', (e) => e.matches && closeMenu());

  /* ---------- clock + year ---------- */
  const clock = $('[data-clock]');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const tick = () => { clock.textContent = `${fmt.format(new Date())} IST`; };
    tick();
    setInterval(tick, 1000);
  }
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  /* ---------- hero swarm (canvas 2D) ---------- */
  const swarm = (() => {
    const canvas = $('#swarm');
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    const pointer = { x: -9999, y: -9999, down: false };
    const waves = [];
    let nodes = [];
    let w = 0, h = 0, cx = 0, cy = 0, frame = 0, visible = true, spread = 0;
    let frozen = reduced || saveData;
    let node = '20 20 18', link = '96 140 0';
    const readColors = () => {
      const cs = getComputedStyle(root);
      node = cs.getPropertyValue('--swarm-node').trim();
      link = cs.getPropertyValue('--swarm-link').trim();
      if (frozen) draw(performance.now());
    };
    const seed = () => {
      const count = w < 720 ? 150 : 300;
      const radius = w < 720 ? Math.min(w * 0.62, h * 0.4) : Math.min(h * 0.5, w * 0.34);
      const golden = Math.PI * (3 - Math.sqrt(5));
      cx = w < 720 ? w * 0.62 : w * 0.7;
      cy = h * 0.5;
      nodes = Array.from({ length: count }, (_, i) => {
        const d = Math.sqrt((i + 0.5) / count) * radius;
        const a = i * golden;
        return { d, a, x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, vx: 0, vy: 0, e: 0 };
      });
    };
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };
    function draw(t = 0) {
      ctx.clearRect(0, 0, w, h);
      waves.forEach((wv) => { wv.r += 12; wv.s *= 0.94; });
      while (waves[0] && (waves[0].r > Math.max(w, h) || waves[0].s < 0.02)) waves.shift();
      const grow = 1 + spread * 0.9;
      for (const n of nodes) {
        const a = n.a + (frozen ? 0 : t * 0.00005 * (1 + 90 / (n.d + 90)));
        const tx = cx + Math.cos(a) * n.d * grow;
        const ty = cy + Math.sin(a) * n.d * grow - spread * 60;
        n.vx += (tx - n.x) * 0.02;
        n.vy += (ty - n.y) * 0.02;
        const dx = n.x - pointer.x, dy = n.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        const R = 120;
        if (dist < R && dist > 0) {
          const f = (1 - dist / R) * (pointer.down ? -0.6 : 1.3);
          n.vx += (dx / dist) * f;
          n.vy += (dy / dist) * f;
          n.e = Math.max(n.e, 1 - dist / R);
        }
        for (const wv of waves) {
          const sx = n.x - wv.x, sy = n.y - wv.y;
          const sd = Math.hypot(sx, sy);
          const edge = Math.abs(sd - wv.r);
          if (edge < 26 && sd > 0) {
            const f = (1 - edge / 26) * wv.s * 9;
            n.vx += (sx / sd) * f; n.vy += (sy / sd) * f; n.e = 1;
          }
        }
        n.vx *= 0.88; n.vy *= 0.88;
        n.x += n.vx; n.y += n.vy;
        n.e *= 0.95;
      }
      ctx.lineWidth = 0.7;
      for (let i = 0; i < nodes.length; i += 1) {
        const n = nodes[i];
        // Phyllotaxis neighbours sit at Fibonacci index offsets, so a short window finds them.
        for (let j = i + 5; j < Math.min(nodes.length, i + 35); j += 1) {
          const o = nodes[j];
          const d = Math.hypot(n.x - o.x, n.y - o.y);
          if (d > 64) continue;
          const alpha = (1 - d / 64) * (0.22 + Math.max(n.e, o.e) * 0.65);
          ctx.strokeStyle = `rgb(${link} / ${alpha})`;
          ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(o.x, o.y); ctx.stroke();
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = n.e > 0.15 ? `rgb(${link} / ${0.55 + n.e * 0.45})` : `rgb(${node} / .5)`;
        ctx.beginPath(); ctx.arc(n.x, n.y, 1.4 + n.e * 2.4, 0, Math.PI * 2); ctx.fill();
      }
      if (!frozen && visible && !document.hidden) frame = requestAnimationFrame(draw);
    }
    const start = () => { cancelAnimationFrame(frame); if (!frozen && visible && !document.hidden) frame = requestAnimationFrame(draw); };
    const pulse = (x = cx, y = cy) => { waves.push({ x, y, r: 6, s: 1 }); if (frozen) { for (let i = 0; i < 18; i += 1) draw(performance.now()); } };
    const local = (e) => { const r = canvas.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; };

    // Listen on the hero so text and buttons above the canvas still steer the field.
    const hero = canvas.parentElement;
    hero.addEventListener('pointermove', local, { passive: true });
    hero.addEventListener('pointerdown', (e) => {
      if (e.target.closest('a, button')) return;
      local(e); pointer.down = true; pulse(pointer.x, pointer.y);
    });
    window.addEventListener('pointerup', () => { pointer.down = false; });
    hero.addEventListener('pointerleave', () => { pointer.x = pointer.y = -9999; pointer.down = false; });
    hero.addEventListener('pointercancel', () => { pointer.x = pointer.y = -9999; pointer.down = false; });

    $('#swarm-pulse').addEventListener('click', () => pulse());
    const freezeBtn = $('#swarm-freeze');
    const syncFreeze = () => { freezeBtn.setAttribute('aria-pressed', String(frozen)); freezeBtn.textContent = frozen ? 'Resume' : 'Freeze'; };
    freezeBtn.addEventListener('click', () => { frozen = !frozen; syncFreeze(); start(); });
    syncFreeze();

    new IntersectionObserver(([en]) => { visible = en.isIntersecting; start(); }).observe(canvas);
    document.addEventListener('visibilitychange', start);
    new ResizeObserver(() => { resize(); if (frozen) draw(); }).observe(canvas);
    themeListeners.push(readColors);
    resize();
    readColors();
    draw();
    return { setSpread: (v) => { spread = v; if (frozen) draw(); } };
  })();

  /* ---------- HERMES packet pipeline (illustrative) ---------- */
  (() => {
    const canvas = $('#packets');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, frame = 0, visible = false, last = 0, spawn = 0;
    const packets = [];
    const gates = [0.33, 0.62, 0.9];
    const flashes = [0, 0, 0];
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const add = (x = -10) => {
      const r = Math.random();
      packets.push({
        x, y: h * (0.14 + Math.random() * 0.72), v: 70 + Math.random() * 60,
        bad: r < 0.18 ? 1 : r < 0.27 ? 2 : 0, // 1: caught by signature, 2: caught by model
        state: 0, vy: 0, a: 1, len: 6 + Math.random() * 14
      });
    };
    const step = (dt) => {
      spawn += dt;
      while (spawn > 0.045) { spawn -= 0.045; add(); }
      for (const p of packets) {
        p.x += p.v * dt;
        if (p.state === 0 && p.bad === 1 && p.x > w * gates[0]) { p.state = 1; flashes[0] = 1; }
        if (p.state === 0 && p.bad === 2 && p.x > w * gates[1]) { p.state = 1; flashes[1] = 1; }
        if (p.state === 0 && !p.bad && p.x > w * gates[2] && !p.ok) { p.ok = 1; flashes[2] = Math.max(flashes[2], 0.4); }
        if (p.state === 1) { p.v *= 0.9; p.vy += 260 * dt; p.y += p.vy * dt; p.a -= dt * 1.6; }
      }
      for (let i = packets.length - 1; i >= 0; i -= 1) if (packets[i].x > w + 30 || packets[i].a <= 0) packets.splice(i, 1);
      for (let i = 0; i < 3; i += 1) flashes[i] *= 0.92;
    };
    const paint = () => {
      ctx.clearRect(0, 0, w, h);
      gates.forEach((g, i) => {
        const x = w * g;
        ctx.strokeStyle = `rgb(236 235 228 / ${0.12 + flashes[i] * 0.5})`;
        ctx.setLineDash([3, 6]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, h * 0.08); ctx.lineTo(x, h * 0.92); ctx.stroke();
        ctx.setLineDash([]);
        const glow = ctx.createRadialGradient(x, h / 2, 0, x, h / 2, h * 0.5);
        glow.addColorStop(0, `rgb(${i === 2 ? '196 245 66' : '255 91 46'} / ${flashes[i] * 0.12})`);
        glow.addColorStop(1, 'rgb(0 0 0 / 0)');
        ctx.fillStyle = glow; ctx.fillRect(x - h * 0.5, 0, h, h);
        if (i === 1) { // three ARM nodes on the inference gate
          for (let k = 0; k < 3; k += 1) {
            const y = h * (0.28 + k * 0.22);
            ctx.fillStyle = 'rgb(25 26 23)'; ctx.strokeStyle = `rgb(196 245 66 / ${0.35 + flashes[1] * 0.6})`;
            ctx.beginPath(); ctx.roundRect(x - 13, y - 13, 26, 26, 6); ctx.fill(); ctx.stroke();
            ctx.fillStyle = `rgb(196 245 66 / ${0.5 + flashes[1] * 0.5})`;
            ctx.fillRect(x - 3, y - 3, 6, 6);
          }
        }
      });
      ctx.lineCap = 'round'; ctx.lineWidth = 2;
      for (const p of packets) {
        const flagged = p.state === 1;
        const passed = p.ok;
        ctx.strokeStyle = flagged ? `rgb(255 91 46 / ${p.a})` : passed ? 'rgb(196 245 66 / .95)' : 'rgb(236 235 228 / .55)';
        ctx.beginPath(); ctx.moveTo(p.x - p.len, p.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      }
    };
    const loop = (t) => {
      const dt = Math.min(0.05, (t - (last || t)) / 1000);
      last = t;
      step(dt); paint();
      if (visible && !document.hidden) frame = requestAnimationFrame(loop);
    };
    const start = () => { cancelAnimationFrame(frame); last = 0; if (visible && !document.hidden && !reduced) frame = requestAnimationFrame(loop); };
    new ResizeObserver(() => { resize(); if (reduced || !visible) { packets.length = 0; for (let x = 0; x < w; x += 9) add(x); for (let i = 0; i < 40; i += 1) step(0.016); paint(); } }).observe(canvas);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }, { rootMargin: '80px' }).observe(canvas);
    document.addEventListener('visibilitychange', start);
  })();

  /* ---------- terminal typing ---------- */
  (() => {
    const code = $('[data-type]');
    if (!code || reduced) return;
    const parts = [['$ git log --author=vyas\n'], ['✓ 6 merged changes', 'ok'], ['\nui · storage · shell · a11y']];
    const original = code.innerHTML;
    code.textContent = '';
    new IntersectionObserver(([e], obs) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let p = 0, c = 0;
      const out = parts.map(() => '');
      const esc = (s) => s.replace(/[&<>]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
      const type = () => {
        if (p >= parts.length) { code.innerHTML = original; return; }
        out[p] += parts[p][0][c];
        code.innerHTML = out.map((s, i) => (parts[i][1] ? `<span class="${parts[i][1]}">${esc(s)}</span>` : esc(s))).join('');
        c += 1;
        if (c >= parts[p][0].length) { p += 1; c = 0; setTimeout(type, 380); }
        else setTimeout(type, p === 0 ? 38 + Math.random() * 40 : 18);
      };
      setTimeout(type, 300);
    }, { threshold: 0.6 }).observe(code);
  })();

  /* ---------- project preview that follows the cursor ---------- */
  (() => {
    const list = $('.projects');
    const preview = $('.preview');
    if (!list || !preview || !fine || !gsap) return;
    const inner = $('.preview-inner', preview);
    const wide = media('(min-width: 861px)');
    const xTo = gsap.quickTo(preview, 'x', { duration: 0.6, ease: 'power3' });
    const yTo = gsap.quickTo(preview, 'y', { duration: 0.6, ease: 'power3' });
    const rTo = gsap.quickTo(preview, 'rotation', { duration: 0.8, ease: 'power3' });
    const items = $$('.project', list);
    const layers = new Map(); // one persistent layer per project, so hover never waits on the network
    let lastX = 0, current = null, hovering = false, hideTimer = 0;

    items.forEach((item) => {
      const src = item.dataset.preview;
      let layer;
      if (src.startsWith('art-')) { layer = $('.p-media', item).cloneNode(true); layer.removeAttribute('aria-hidden'); }
      else { layer = new Image(); layer.alt = ''; layer.decoding = 'async'; layer.src = src; }
      layer.classList.add('preview-layer');
      layers.set(item, layer);
      inner.append(layer);
    });
    gsap.set([...layers.values()], { autoAlpha: 0 });
    gsap.set(preview, { xPercent: -50, yPercent: -50 });

    list.addEventListener('pointermove', (e) => {
      if (!wide.matches) return;
      xTo(e.clientX + 40); yTo(e.clientY);
      rTo(clamp((e.clientX - lastX) * 0.6, -10, 10));
      lastX = e.clientX;
    });

    const show = (item) => {
      if (item === current) return;
      const next = layers.get(item), prev = current && layers.get(current);
      current = item;
      if (prev) gsap.to(prev, { autoAlpha: 0, duration: 0.3, ease: 'power2.out', overwrite: true });
      gsap.fromTo(next, { autoAlpha: 1, clipPath: 'inset(100% 0 0 0)', scale: 1.15 }, { clipPath: 'inset(0% 0 0 0)', scale: 1, duration: 0.7, ease: 'expo.out', overwrite: true, zIndex: 2 });
      if (prev) gsap.set(prev, { zIndex: 1 });
    };

    items.forEach((item) => {
      item.addEventListener('pointerenter', (e) => {
        if (!wide.matches) return;
        clearTimeout(hideTimer);
        if (!hovering) { gsap.set(preview, { x: e.clientX + 40, y: e.clientY }); lastX = e.clientX; }
        hovering = true;
        show(item);
        gsap.to(preview, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'expo.out', overwrite: 'auto' });
      });
    });
    list.addEventListener('pointerleave', () => {
      hovering = false;
      gsap.to(preview, { autoAlpha: 0, scale: 0.6, duration: 0.4, ease: 'power3.in', overwrite: 'auto' });
      hideTimer = setTimeout(() => { current = null; gsap.set([...layers.values()], { autoAlpha: 0 }); }, 450);
    });
  })();

  /* ---------- cursor chip (contextual label, fine pointers only) ---------- */
  const chip = (() => {
    const el = $('.cursor-chip');
    if (!fine || !gsap || reduced) return { bind() {} };
    const label = $('span', el);
    const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3' });
    window.addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); }, { passive: true });
    return {
      bind(target, text) {
        target.addEventListener('pointerenter', (e) => { gsap.set(el, { x: e.clientX, y: e.clientY }); label.textContent = typeof text === 'function' ? text() : text; el.classList.add('is-on'); });
        target.addEventListener('pointerleave', () => el.classList.remove('is-on'));
      }
    };
  })();

  /* ---------- magnetic buttons ---------- */
  if (fine && gsap && !reduced) {
    $$('.magnetic').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.22);
        yTo((e.clientY - r.top - r.height / 2) * 0.3);
      });
      el.addEventListener('pointerleave', () => { gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, .4)' }); });
    });
  }

  /* ---------- notes deck (tap, swipe, drag, keys) ---------- */
  (() => {
    const deck = $('.notes-deck');
    if (!deck) return;
    const cards = $$('.note', deck);
    const count = $('.notes-count');
    let order = cards.map((_, i) => i);
    let busy = false;
    const layout = (instant) => {
      order.forEach((ci, depth) => {
        const c = cards[ci];
        const props = {
          y: depth * 16, scale: 1 - depth * 0.045, rotation: depth === 0 ? 0 : (depth % 2 ? 2.2 : -1.6) * depth * 0.6,
          opacity: depth > 3 ? 0 : 1, zIndex: cards.length - depth
        };
        c.setAttribute('aria-hidden', String(depth !== 0));
        if (gsap) gsap.to(c, { ...props, duration: instant || reduced ? 0 : 0.8, ease: 'expo.out' });
        else { c.style.zIndex = props.zIndex; c.style.transform = `translateY(${props.y}px) scale(${props.scale}) rotate(${props.rotation}deg)`; c.style.opacity = props.opacity; }
      });
      count.textContent = `${String(order[0] + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
    };
    const go = (dir, fromX = 0) => {
      if (busy) return;
      tap(6);
      const top = cards[order[0]];
      if (dir > 0) order.push(order.shift()); else order.unshift(order.pop());
      if (!gsap || reduced) { layout(true); return; }
      busy = true;
      if (dir > 0) {
        gsap.fromTo(top, { x: fromX }, { x: fromX < 0 ? -innerWidth * 0.6 : innerWidth * 0.6, rotation: fromX < 0 ? -18 : 18, opacity: 0, duration: 0.45, ease: 'power2.in', onComplete: () => { gsap.set(top, { x: 0 }); layout(); busy = false; } });
      } else {
        const incoming = cards[order[0]];
        gsap.set(incoming, { zIndex: cards.length + 1 });
        gsap.fromTo(incoming, { x: fromX || -innerWidth * 0.5, rotation: -14, opacity: 0 }, { x: 0, rotation: 0, opacity: 1, duration: 0.6, ease: 'expo.out', onComplete: () => { layout(); busy = false; } });
        gsap.set(top, { x: 0 });
      }
    };
    $$('[data-note]').forEach((b) => b.addEventListener('click', () => go(Number(b.dataset.note))));
    deck.tabIndex = 0;
    deck.setAttribute('aria-label', 'Notes — use left and right arrow keys');
    deck.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    // drag / swipe the top card
    let startX = 0, dx = 0, dragging = false;
    deck.addEventListener('pointerdown', (e) => {
      if (busy || e.button > 0) return;
      dragging = true; startX = e.clientX; dx = 0;
      deck.setPointerCapture(e.pointerId);
    });
    deck.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      dx = e.clientX - startX;
      const top = cards[order[0]];
      if (gsap) gsap.set(top, { x: dx, rotation: dx * 0.04 });
    });
    const end = () => {
      if (!dragging) return;
      dragging = false;
      if (Math.abs(dx) > 70) go(dx < 0 ? 1 : -1, dx);
      else if (Math.abs(dx) < 6) go(1);
      else if (gsap) gsap.to(cards[order[0]], { x: 0, rotation: 0, duration: 0.6, ease: 'elastic.out(1, .5)' });
    };
    deck.addEventListener('pointerup', end);
    deck.addEventListener('pointercancel', end);
    chip.bind(deck, 'Drag');
    layout(true);
  })();

  /* ---------- photography ---------- */
  const gallery = $('#gallery');
  const lightbox = $('#lightbox');
  let albums = null;
  let album = 'landscapes';
  let shots = [];
  let lbIndex = 0;

  const thumbWidth = (p) => (p.w >= p.h ? Math.min(720, p.w) : Math.round((Math.min(720, p.h) * p.w) / p.h));
  const renderAlbum = (name, animate) => {
    const items = albums[name];
    const build = () => {
      gallery.replaceChildren(...items.map((p, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'shot';
        b.style.setProperty('--ar', `${p.w} / ${p.h}`);
        const label = p.caption || `Frame ${String(i + 1).padStart(2, '0')}`;
        b.setAttribute('aria-label', `Open photograph ${i + 1} of ${items.length}${p.caption ? `: ${p.caption}` : ''}`);
        const img = new Image();
        img.alt = p.caption || `Photograph by Devgna Vyas, ${name === 'animals' ? 'animals' : 'places'} ${i + 1}`;
        img.decoding = 'async';
        img.loading = i < 4 ? 'eager' : 'lazy';
        img.width = p.w; img.height = p.h;
        img.sizes = `calc(${(p.w / p.h).toFixed(3)} * min(56vh, 620px))`;
        img.srcset = `${p.thumb} ${thumbWidth(p)}w, ${p.src} ${p.w}w`;
        img.src = p.thumb;
        img.dataset.loading = '';
        img.addEventListener('load', () => img.removeAttribute('data-loading'), { once: true });
        const cap = document.createElement('span');
        cap.innerHTML = `<b></b><i>${String(i + 1).padStart(2, '0')}</i>`;
        cap.firstChild.textContent = label;
        b.append(img, cap);
        b.addEventListener('click', () => openLightbox(i));
        return b;
      }));
      shots = $$('.shot', gallery);
      gallery.scrollLeft = 0;
      parallax();
      galleryState();
      if (animate && motion) gsap.from(shots.slice(0, 6), { y: 60, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.06 });
      if (ST) ST.refresh();
    };
    if (animate && motion && shots.length) gsap.to(shots.slice(0, 6), { y: -30, opacity: 0, duration: 0.35, ease: 'power2.in', stagger: 0.03, onComplete: build });
    else build();
  };

  let parallaxTick = false;
  function parallax() {
    parallaxTick = false;
    if (reduced) return;
    const mid = innerWidth / 2;
    for (const s of shots) {
      const r = s.getBoundingClientRect();
      if (r.right < -100 || r.left > innerWidth + 100) continue;
      const off = (r.left + r.width / 2 - mid) / innerWidth;
      s.firstChild.style.transform = `translateX(${(-off * 8).toFixed(2)}%) scale(1.14)`;
    }
  }
  const gBar = $('.g-progress i');
  const gCount = $('.g-count');
  const gPrev = $('[data-g="-1"]');
  const gNext = $('[data-g="1"]');
  function galleryState() {
    const max = gallery.scrollWidth - gallery.clientWidth;
    const p = max > 0 ? clamp(gallery.scrollLeft / max) : 1;
    const pad = parseFloat(getComputedStyle(gallery).paddingLeft) || 0;
    const visible = shots.findIndex((sh) => sh.offsetLeft + sh.offsetWidth > gallery.scrollLeft + pad + 24);
    gBar.style.transform = `scaleX(${(max > 0 ? Math.max(0.04, p) : 1).toFixed(3)})`;
    gCount.textContent = `${String(Math.max(0, visible) + 1).padStart(2, '0')} / ${String(shots.length).padStart(2, '0')}`;
    gPrev.disabled = gallery.scrollLeft < 4;
    gNext.disabled = gallery.scrollLeft > max - 4;
  }
  gallery.addEventListener('scroll', () => { galleryState(); if (!parallaxTick) { parallaxTick = true; requestAnimationFrame(parallax); } }, { passive: true });
  $$('[data-g]').forEach((b) => b.addEventListener('click', () => {
    gallery.scrollBy({ left: Number(b.dataset.g) * Math.min(gallery.clientWidth * 0.8, 900), behavior: reduced ? 'auto' : 'smooth' });
  }));
  window.addEventListener('resize', parallax, { passive: true });

  // Mouse drag with inertia (touch and trackpads keep native scrolling).
  (() => {
    let down = false, startX = 0, startLeft = 0, moved = 0, v = 0, lastX = 0, lastT = 0, raf = 0;
    gallery.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      cancelAnimationFrame(raf);
      down = true; moved = 0; startX = lastX = e.clientX; startLeft = gallery.scrollLeft; lastT = performance.now(); v = 0;
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 5) gallery.classList.add('is-dragging');
      gallery.scrollLeft = startLeft - dx;
      const now = performance.now();
      v = (lastX - e.clientX) / Math.max(1, now - lastT) * 16;
      lastX = e.clientX; lastT = now;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      requestAnimationFrame(() => gallery.classList.remove('is-dragging'));
      if (reduced) return;
      const glide = () => { v *= 0.94; gallery.scrollLeft += v; if (Math.abs(v) > 0.4) raf = requestAnimationFrame(glide); };
      raf = requestAnimationFrame(glide);
    });
    gallery.addEventListener('click', (e) => { if (moved > 5) { e.stopPropagation(); e.preventDefault(); moved = 0; } }, true);
    gallery.addEventListener('dragstart', (e) => e.preventDefault());
  })();
  chip.bind(gallery, 'Drag');

  const tabsEl = $('.tabs');
  const placeTabPill = () => {
    const on = $('[aria-selected="true"]', tabsEl);
    tabsEl.style.setProperty('--x', `${on.offsetLeft}px`);
    tabsEl.style.setProperty('--w', `${on.offsetWidth}px`);
  };
  window.addEventListener('resize', placeTabPill, { passive: true });
  if (document.fonts) document.fonts.ready.then(placeTabPill);
  placeTabPill();

  $$('[role="tab"][data-album]').forEach((tab, _, tabs) => {
    tab.addEventListener('click', () => {
      if (!albums || tab.dataset.album === album) return;
      album = tab.dataset.album;
      tabs.forEach((t) => { t.setAttribute('aria-selected', String(t === tab)); t.tabIndex = t === tab ? 0 : -1; });
      placeTabPill();
      tap();
      renderAlbum(album, true);
    });
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = tabs[(tabs.indexOf(tab) + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      next.focus(); next.click();
    });
  });

  const loadGallery = async () => {
    try {
      const res = await fetch('gallery.json');
      if (!res.ok) throw new Error(String(res.status));
      albums = await res.json();
      $$('[data-album-count]').forEach((el) => { el.textContent = String(albums[el.dataset.albumCount].length); });
      renderAlbum(album, false);
    } catch {
      gallery.innerHTML = '<p class="wrap album-hint">The photo archive is unavailable right now.</p>';
    }
  };
  new IntersectionObserver(([e], obs) => { if (e.isIntersecting) { obs.disconnect(); loadGallery(); } }, { rootMargin: '900px 0px' }).observe(gallery);

  /* lightbox */
  const lbImg = $('img', lightbox);
  const lbCaption = $('.lb-caption', lightbox);
  const lbIndexEl = $('.lb-index', lightbox);
  const showPhoto = (i, dir = 0) => {
    const items = albums[album];
    lbIndex = (i + items.length) % items.length;
    const p = items[lbIndex];
    const set = () => {
      lbImg.classList.add('is-thumb');
      lbImg.src = p.thumb;
      lbImg.width = p.w; lbImg.height = p.h;
      lbImg.alt = p.caption || `Photograph ${lbIndex + 1}`;
      const full = new Image();
      full.src = p.src;
      full.decode().then(() => { if (items[lbIndex] === p) { lbImg.src = p.src; lbImg.classList.remove('is-thumb'); } }).catch(() => lbImg.classList.remove('is-thumb'));
      lbCaption.textContent = p.caption || 'Untitled';
      lbIndexEl.textContent = `${String(lbIndex + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
      // warm the neighbours
      [items[(lbIndex + 1) % items.length], items[(lbIndex - 1 + items.length) % items.length]].forEach((n) => { new Image().src = n.src; });
    };
    if (dir && motion) {
      gsap.to(lbImg, { x: -dir * 60, opacity: 0, duration: 0.2, ease: 'power2.in', onComplete: () => { set(); gsap.fromTo(lbImg, { x: dir * 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }); } });
    } else set();
  };
  function openLightbox(i) {
    showPhoto(i);
    lightbox.showModal();
    lockScroll(true);
    const from = shots[i] && shots[i].getBoundingClientRect();
    if (motion && from) {
      requestAnimationFrame(() => {
        const to = lbImg.getBoundingClientRect();
        if (!to.width) return;
        gsap.from(lbImg, {
          x: from.left + from.width / 2 - (to.left + to.width / 2),
          y: from.top + from.height / 2 - (to.top + to.height / 2),
          scale: Math.max(from.width / to.width, from.height / to.height),
          duration: 0.8, ease: 'expo.out', clearProps: 'transform'
        });
      });
    }
  }
  lightbox.addEventListener('close', () => lockScroll(false));
  $('.lb-close', lightbox).addEventListener('click', () => closeDialog(lightbox));
  $('.lb-prev', lightbox).addEventListener('click', () => showPhoto(lbIndex - 1, -1));
  $('.lb-next', lightbox).addEventListener('click', () => showPhoto(lbIndex + 1, 1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeDialog(lightbox); });
  lightbox.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') showPhoto(lbIndex + 1, 1);
    if (e.key === 'ArrowLeft') showPhoto(lbIndex - 1, -1);
  });
  (() => {
    let sx = 0, sy = 0, active = false;
    lightbox.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') return; active = true; sx = e.clientX; sy = e.clientY; });
    lightbox.addEventListener('pointerup', (e) => {
      if (!active) return;
      active = false;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) showPhoto(lbIndex + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) closeDialog(lightbox);
    });
  })();

  /* ---------- command palette (⌘K / Ctrl+K / "/") ---------- */
  (() => {
    const dlg = $('#palette');
    const input = $('input', dlg);
    const list = $('ul', dlg);
    const go = (id) => () => scrollToTarget(document.getElementById(id));
    const open = (url) => () => window.open(url, '_blank', 'noopener');
    const commands = [
      ['Home', 'Section', go('home')],
      ['Selected work', 'Section', go('work')],
      ['Research & open source', 'Section', go('research')],
      ['About', 'Section', go('about')],
      ['Photography', 'Section', go('photography')],
      ['Contact', 'Section', go('contact')],
      ['Copy email address', 'Action', () => copyEmail()],
      ['Send an email', 'Action', () => { location.href = `mailto:${EMAIL}`; }],
      ['Toggle light / dark', 'Action', () => toggleTheme()],
      ['GitHub — @vyas-devgna', 'Link', open('https://github.com/vyas-devgna')],
      ['LinkedIn — devgna-vyas', 'Link', open('https://linkedin.com/in/devgna-vyas')],
      ...$$('.project a').map((a) => [`${$('.p-title', a).textContent} — ${$('.p-desc', a).textContent}`, 'Project', open(a.href)]),
      ['WinUtil — merged pull requests', 'Link', open($('.winutil a').href)]
    ];
    let filtered = commands, sel = 0;
    const render = () => {
      const q = input.value.trim().toLowerCase();
      filtered = commands.filter(([label, kind]) => `${label} ${kind}`.toLowerCase().includes(q));
      sel = Math.min(sel, Math.max(0, filtered.length - 1));
      list.replaceChildren(...filtered.map(([label, kind], i) => {
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.id = `cmd-${i}`;
        li.setAttribute('aria-selected', String(i === sel));
        const name = document.createElement('span');
        const at = q ? label.toLowerCase().indexOf(q) : -1;
        if (at < 0) name.textContent = label;
        else {
          const m = document.createElement('mark');
          m.textContent = label.slice(at, at + q.length);
          name.append(label.slice(0, at), m, label.slice(at + q.length));
        }
        li.append(name, Object.assign(document.createElement('small'), { textContent: kind }));
        li.addEventListener('click', () => run(i));
        li.addEventListener('pointermove', () => { if (sel !== i) { sel = i; mark(); } });
        return li;
      }));
      if (!filtered.length) list.innerHTML = '<li aria-disabled="true"><span>No matches</span></li>';
      input.setAttribute('aria-activedescendant', filtered.length ? `cmd-${sel}` : '');
    };
    const mark = () => {
      $$('li', list).forEach((li, i) => li.setAttribute('aria-selected', String(i === sel)));
      const cur = list.children[sel];
      if (cur) cur.scrollIntoView({ block: 'nearest' });
      input.setAttribute('aria-activedescendant', `cmd-${sel}`);
    };
    const run = (i) => { const c = filtered[i]; if (!c) return; closeDialog(dlg); c[2](); };
    const show = () => { if (dlg.open) return; input.value = ''; sel = 0; render(); dlg.showModal(); lockScroll(true); input.focus(); };
    dlg.addEventListener('close', () => lockScroll(false));
    dlg.addEventListener('click', (e) => { if (e.target === dlg) closeDialog(dlg); });
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-controls', 'palette-list');
    list.id = 'palette-list';
    input.addEventListener('input', () => { sel = 0; render(); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % Math.max(1, filtered.length); mark(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + filtered.length) % Math.max(1, filtered.length); mark(); }
      if (e.key === 'Enter') { e.preventDefault(); run(sel); }
    });
    $$('[data-palette-open]').forEach((b) => b.addEventListener('click', show));
    if (!/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) $$('.kbd-only kbd, .footer kbd').forEach((k) => { k.textContent = 'Ctrl K'; });
    window.addEventListener('keydown', (e) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
      if ((e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing && !lightbox.open)) { e.preventDefault(); show(); }
    });
  })();

  /* ---------- motion layer (GSAP) ---------- */
  const finishLoading = () => {
    root.classList.remove('is-loading');
    try { sessionStorage.setItem('seen', '1'); } catch {}
  };

  const intro = () => {
    if (!motion) { finishLoading(); return; }
    const Split = window.SplitText;
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    const loader = $('.loader');

    if (root.classList.contains('is-loading')) {
      lockScroll(true);
      const n = { v: 0 };
      const countEl = $('.loader-count');
      tl.from('.loader-name span', { yPercent: 110, duration: 1, stagger: 0.08 })
        .to(n, { v: 100, duration: 1.1, ease: 'power2.inOut', onUpdate: () => { countEl.textContent = String(Math.round(n.v)).padStart(3, '0'); } }, 0)
        .to('.loader-bar', { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, 0)
        .to(loader, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '+=.1')
        .add(() => { finishLoading(); lockScroll(false); gsap.set(loader, { clearProps: 'all' }); });
    }

    const heroSplit = Split ? Split.create('.hero-title .line', { type: 'words,chars', mask: 'words', maskClass: 'ln-mask' }) : null;
    tl.from(heroSplit ? heroSplit.chars : '.hero-title .line', { yPercent: 115, duration: 1.3, stagger: 0.022 }, root.classList.contains('is-loading') ? '-=.55' : 0.1)
      .from('.hero-meta > *', { y: 16, opacity: 0, duration: 0.9, stagger: 0.06 }, '<.3')
      .from('.hero-intro, .hero-cta > *, .swarm-ui', { y: 24, opacity: 0, duration: 1, stagger: 0.07 }, '<.1')
      .from('.topbar > *', { y: -20, opacity: 0, duration: 0.9, stagger: 0.06 }, '<');
  };

  const scrollMotion = () => {
    if (!motion) return;
    const Split = window.SplitText;

    // Hero dissolves into the page.
    ST.create({ trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true, onUpdate: (s) => swarm && swarm.setSpread(s.progress) });
    gsap.to('.hero-title', { yPercent: -18, opacity: 0.15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // Section headings: line-by-line mask reveal.
    if (Split) {
      $$('.split').forEach((el) => {
        Split.create(el, {
          type: 'lines', mask: 'lines', maskClass: 'ln-mask', autoSplit: true,
          onSplit: (self) => gsap.from(self.lines, { yPercent: 105, duration: 1.2, ease: 'expo.out', stagger: 0.09, scrollTrigger: { trigger: el, start: 'top 85%', once: true } })
        });
      });
      // Long statements light up word by word with scroll.
      $$('.reveal-words').forEach((el) => {
        const s = Split.create(el, { type: 'words' });
        gsap.fromTo(s.words, { opacity: 0.14 }, { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 55%', scrub: true } });
      });
    }

    // Cards and rows rise in batches.
    const rise = $$('.proof-stats > div, .project, .hermes, .research .card, .facts .card, .profile-links, .contact-links a, .mail-row, .notes-head, .album-bar');
    gsap.set(rise, { y: 50, opacity: 0 });
    ST.batch(rise, { start: 'top 90%', once: true, onEnter: (b) => gsap.to(b, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.08, overwrite: true }) });

    // Count-ups.
    $$('[data-count]').forEach((el) => {
      const end = parseFloat(el.dataset.count);
      const dec = Number(el.dataset.decimals || 0);
      const o = { v: 0 };
      el.textContent = (0).toFixed(dec);
      ST.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.8, ease: 'expo.out', onUpdate: () => { el.textContent = o.v.toFixed(dec); } }) });
    });

    // Ticker: endless loop whose speed and direction follow scroll velocity.
    const track = $('.ticker-track');
    if (track) {
      track.append(...[...track.children].map((n) => n.cloneNode(true)));
      const loop = gsap.to(track, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
      let dir = 1;
      ST.create({
        trigger: '.ticker', start: 'top bottom', end: 'bottom top',
        onUpdate: (s) => {
          const v = s.getVelocity();
          if (Math.abs(v) > 30) dir = v > 0 ? 1 : -1;
          gsap.to(loop, { timeScale: dir * clamp(1 + Math.abs(v) / 400, 1, 6), duration: 0.2, overwrite: true });
          gsap.to(loop, { timeScale: dir, duration: 1.2, delay: 0.2, overwrite: false });
        }
      });
    }

    // Portrait parallax and the closing signature.
    gsap.fromTo('.portrait img', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.portrait', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.portrait', { clipPath: 'inset(18% 12% 18% 12% round 22px)', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.portrait', start: 'top 85%', once: true } });
    gsap.from('.bigname', { yPercent: 60, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'bottom bottom+=40%', end: 'bottom bottom', scrub: true } });
    gsap.from('.hermes-viz', { scale: 0.92, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.hermes', start: 'top 75%', once: true } });
  };

  const boot = () => {
    // Wait for fonts so text splits measure correctly, but never more than 1.2s.
    const fonts = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]) : Promise.resolve();
    fonts.then(() => {
      intro();
      scrollMotion();
      if (location.hash) scrollToTarget(document.getElementById(location.hash.slice(1)), true);
      if (ST) ST.refresh();
    });
  };
  boot();
  setTimeout(finishLoading, 4000); // never trap anyone behind the loader
})();
