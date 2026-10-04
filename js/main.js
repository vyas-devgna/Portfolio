/* Devgna Vyas — portfolio interactions.
   Progressive: every section reads fine without this file; GSAP/Lenis/WebGL are optional upgrades. */
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
  const motion = Boolean(gsap && ST) && fine && !reduced && !saveData;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const EMAIL = 'vyasdevgna@gmail.com';
  const tap = (ms = 8) => { if (!reduced && navigator.vibrate) navigator.vibrate(ms); };

  if (gsap) gsap.registerPlugin(...[ST].filter(Boolean));
  if (motion) root.classList.add('motion');

  const lockScroll = (on) => { document.body.style.overflow = on ? 'hidden' : ''; };
  const closeDialog = (d) => { if (d.open) d.close(); lockScroll(false); };

  const scrollToTarget = (target, instant = false) => {
    if (!target) return;
    const top = target.id === 'home';
    if (top) window.scrollTo({ top: 0, behavior: instant || reduced ? 'auto' : 'smooth' });
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
    if (!btn) { toast('Email copied'); return; }
    btn.classList.add('is-copied');
    clearTimeout(btn._t);
    btn._t = setTimeout(() => btn.classList.remove('is-copied'), 1800);
  };
  $$('[data-copy]').forEach((b) => b.addEventListener('click', copyEmail));

  /* ---------- theme ---------- */
  const isDark = () => (root.dataset.theme ? root.dataset.theme === 'dark' : media('(prefers-color-scheme: dark)').matches);
  const themeListeners = [];
  const setTheme = (dark) => {
    root.dataset.theme = dark ? 'dark' : 'light';
    try { localStorage.setItem('theme', root.dataset.theme); } catch {}
    $$('meta[name="theme-color"]').forEach((m) => { m.content = dark ? '#000000' : '#fbfbfd'; });
    themeListeners.forEach((fn) => fn());
  };
  const toggleTheme = (e) => {
    const src = e && e.currentTarget && e.currentTarget.getBoundingClientRect ? e.currentTarget.getBoundingClientRect() : null;
    root.style.setProperty('--vx', src ? `${src.left + src.width / 2}px` : '50%');
    root.style.setProperty('--vy', src ? `${src.top + src.height / 2}px` : '0px');
    const apply = () => setTheme(!isDark());
    if (document.startViewTransition && !reduced) document.startViewTransition(apply);
    else apply();
    tap();
  };
  $$('[data-theme-toggle]').forEach((b) => b.addEventListener('click', toggleTheme));
  media('(prefers-color-scheme: dark)').addEventListener('change', () => themeListeners.forEach((fn) => fn()));

  /* ---------- nav: progress, scrolled state, active section ---------- */
  const gnav = $('.gnav');
  const bar = $('.progress i');
  let ticking = false;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    gnav.classList.toggle('is-scrolled', scrollY > 8);
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  const navLinks = $$('.gnav-links a');
  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((l) => {
        const on = l.hash === `#${entry.target.id}`;
        l.classList.toggle('is-active', on);
        on ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50%' });
  $$('main > section[id]').forEach((s) => sectionObs.observe(s));

  /* ---------- mobile menu ---------- */
  const menu = $('#menu');
  const menuBtn = $('.menu-btn');
  function closeMenu() {
    if (!menu || menu.hidden) return;
    menuBtn.setAttribute('aria-expanded', 'false');
    $('main').inert = false;
    $('.footer').inert = false;
    menu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    lockScroll(false);
    setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, reduced ? 0 : 400);
  }
  const openMenu = () => {
    menu.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true');
    $('main').inert = true;
    $('.footer').inert = true;
    document.body.classList.add('menu-open');
    lockScroll(true);
    void menu.offsetWidth; // commit the hidden→shown state so the fade runs
    menu.classList.add('is-open');
    $('nav a', menu).focus({ preventScroll: true });
  };
  menuBtn.addEventListener('click', () => (menuBtn.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu()));
  document.addEventListener('keydown', (e) => {
    if (menuBtn.getAttribute('aria-expanded') !== 'true' || e.key !== 'Tab') return;
    const items = [...$$('a', menu), menuBtn];
    const i = items.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); items.at(-1).focus(); }
    else if (!e.shiftKey && i === items.length - 2) { e.preventDefault(); menuBtn.focus(); }
    else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
  });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { closeMenu(); menuBtn.focus(); } });
  media('(min-width: 1069px)').addEventListener('change', (e) => e.matches && closeMenu());

  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  /* ---------- the living painting (WebGL domain-warped oil) ---------- */
  const FRAG = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif
    uniform vec2 res; uniform float t; uniform vec2 mouse; uniform float dark; uniform float calm; uniform float seed;
    float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
    float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y); }
    float fbm(vec2 p){ float v = 0., a = .5; mat2 r = mat2(.8, .6, -.6, .8);
      for (int i = 0; i < 5; i++) { v += a * noise(p); p = r * p * 2.02 + 3.1; a *= .5; } return v; }
    void main(){
      vec2 p = (gl_FragCoord.xy - .5 * res) / min(res.x, res.y);
      vec2 m = (mouse - .5) * vec2(res.x / res.y, 1.) * (res.x > res.y ? 1. : res.y / res.x);
      float tt = t * .045 + seed;
      vec2 dm = p - m; float pull = exp(-dot(dm, dm) * 5.);
      vec2 q = vec2(fbm(p * 1.3 + tt), fbm(p * 1.3 + vec2(5.2, 1.3) - tt)) + dm * pull * .55;
      vec2 r = vec2(fbm(p * 1.5 + 3.2 * q + vec2(1.7, 9.2) + .12 * tt), fbm(p * 1.5 + 3.2 * q + vec2(8.3, 2.8) - .1 * tt));
      float f = fbm(p * 1.15 + 3.4 * r);
      vec3 cream = vec3(.965, .949, .915), ochre = vec3(.91, .66, .26), verm = vec3(.89, .29, .18),
           ultra = vec3(.15, .24, .62), sage = vec3(.55, .65, .54), ink = vec3(.05, .05, .07);
      vec3 c = mix(cream, ochre, clamp(f * f * 2.3, 0., 1.));
      c = mix(c, ultra, clamp(r.x * r.x * 1.7 - .05, 0., 1.));
      c = mix(c, verm, smoothstep(.47, .64, q.x) * .62);
      c = mix(c, sage, clamp(r.y - .62, 0., 1.) * .9);
      c = mix(c, ink, smoothstep(.75, 1.15, f + r.y * .35) * .35);
      // brush ridges: light catching the impasto
      float ridge = abs(fbm(p * 7. + 4. * r) - .5);
      c += (.06 - ridge * .12) * (1. - dark * .5);
      vec3 base = mix(cream, vec3(0.), dark);
      c = mix(c, base, clamp(calm, 0., 1.));
      c *= mix(1., .62, dark);
      c += (hash(gl_FragCoord.xy + fract(t)) - .5) * .045; // paper grain
      gl_FragColor = vec4(c, 1.);
    }`;

  const makePainting = (canvas, { calm = 0.18, seed = 0, scale = 0.5 } = {}) => {
    if (!canvas || saveData || !fine || reduced || !media('(min-width: 900px)').matches) return null;
    // Keep the CSS painting when this browser cannot provide an efficient GPU context.
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, powerPreference: 'low-power', failIfMajorPerformanceCaveat: true });
    if (!gl) return null;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
    const vs = sh(gl.VERTEX_SHADER, 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}');
    const fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = Object.fromEntries(['res', 't', 'mouse', 'dark', 'calm', 'seed'].map((n) => [n, gl.getUniformLocation(prog, n)]));
    gl.uniform1f(u.seed, seed);
    gl.uniform1f(u.calm, calm);

    const mouse = { x: 0.62, y: 0.55, tx: 0.62, ty: 0.55 };
    let visible = true, paused = reduced, frame = 0, last = 0, clock = 0;
    const setDark = () => gl.uniform1f(u.dark, isDark() ? 1 : 0);
    const resize = () => {
      const k = Math.min(window.devicePixelRatio || 1, 1.5) * scale;
      canvas.width = Math.max(2, Math.round(canvas.clientWidth * k));
      canvas.height = Math.max(2, Math.round(canvas.clientHeight * k));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u.res, canvas.width, canvas.height);
      draw(0);
    };
    function draw(dt) {
      clock += dt;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      gl.uniform1f(u.t, clock);
      gl.uniform2f(u.mouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    const loop = (now) => {
      if (!visible || paused || document.hidden) return;
      frame = requestAnimationFrame(loop);
      if (now - last < 33) return; // ~30fps is plenty for paint
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      draw(dt);
    };
    const start = () => { cancelAnimationFrame(frame); last = 0; if (visible && !paused && !document.hidden) frame = requestAnimationFrame(loop); };
    const host = canvas.parentElement.parentElement;
    host.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / r.width;
      mouse.ty = 1 - (e.clientY - r.top) / r.height;
    }, { passive: true });
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; start(); }).observe(canvas);
    new ResizeObserver(resize).observe(canvas);
    document.addEventListener('visibilitychange', start);
    themeListeners.push(() => { setDark(); draw(0); });
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); cancelAnimationFrame(frame); });
    setDark();
    resize();
    clock = 8 + seed; draw(0);
    start();
    return true;
  };

  makePainting($('#art'), { calm: 0.12, seed: 0, scale: 0.5 });
  makePainting($('#art2'), { calm: 0.25, seed: 37, scale: 0.4 });

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
      packets.push({ x, y: h * (0.14 + Math.random() * 0.72), v: 70 + Math.random() * 60, bad: r < 0.18 ? 1 : r < 0.27 ? 2 : 0, state: 0, vy: 0, a: 1, len: 6 + Math.random() * 14 });
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
        ctx.strokeStyle = `rgb(245 245 247 / ${0.12 + flashes[i] * 0.5})`;
        ctx.setLineDash([3, 6]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, h * 0.08); ctx.lineTo(x, h * 0.92); ctx.stroke();
        ctx.setLineDash([]);
        const glow = ctx.createRadialGradient(x, h / 2, 0, x, h / 2, h * 0.5);
        glow.addColorStop(0, `rgb(${i === 2 ? '48 209 88' : '226 74 44'} / ${flashes[i] * 0.14})`);
        glow.addColorStop(1, 'rgb(0 0 0 / 0)');
        ctx.fillStyle = glow; ctx.fillRect(x - h * 0.5, 0, h, h);
        if (i === 1) { // three ARM nodes on the inference gate
          for (let k = 0; k < 3; k += 1) {
            const y = h * (0.28 + k * 0.22);
            ctx.fillStyle = '#141415'; ctx.strokeStyle = `rgb(231 167 63 / ${0.4 + flashes[1] * 0.6})`;
            ctx.beginPath(); ctx.roundRect(x - 13, y - 13, 26, 26, 7); ctx.fill(); ctx.stroke();
            ctx.fillStyle = `rgb(231 167 63 / ${0.55 + flashes[1] * 0.45})`;
            ctx.fillRect(x - 3, y - 3, 6, 6);
          }
        }
      });
      ctx.lineCap = 'round'; ctx.lineWidth = 2;
      for (const p of packets) {
        ctx.strokeStyle = p.state === 1 ? `rgb(226 74 44 / ${p.a})` : p.ok ? 'rgb(48 209 88 / .95)' : 'rgb(245 245 247 / .5)';
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
        const props = { y: depth * 14, scale: 1 - depth * 0.04, rotation: depth === 0 ? 0 : (depth % 2 ? 1.8 : -1.4) * depth * 0.6, opacity: depth > 3 ? 0 : 1, zIndex: cards.length - depth };
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
        gsap.fromTo(top, { x: fromX }, { x: fromX < 0 ? -innerWidth * 0.6 : innerWidth * 0.6, rotation: fromX < 0 ? -16 : 16, opacity: 0, duration: 0.45, ease: 'power2.in', onComplete: () => { gsap.set(top, { x: 0 }); layout(); busy = false; } });
      } else {
        const incoming = cards[order[0]];
        gsap.set(incoming, { zIndex: cards.length + 1 });
        gsap.fromTo(incoming, { x: fromX || -innerWidth * 0.5, rotation: -12, opacity: 0 }, { x: 0, rotation: 0, opacity: 1, duration: 0.6, ease: 'expo.out', onComplete: () => { layout(); busy = false; } });
        gsap.set(top, { x: 0 });
      }
    };
    deck.tabIndex = 0;
    deck.setAttribute('aria-label', 'Notes — use left and right arrow keys');
    deck.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    let startX = 0, dx = 0, dragging = false;
    deck.addEventListener('pointerdown', (e) => {
      if (busy || e.button > 0) return;
      dragging = true; startX = e.clientX; dx = 0;
      deck.setPointerCapture(e.pointerId);
    });
    deck.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      dx = e.clientX - startX;
      if (gsap) gsap.set(cards[order[0]], { x: dx, rotation: dx * 0.035 });
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
    layout(true);
  })();

  /* ---------- photography: the gallery wall ---------- */
  const gallery = $('#gallery');
  const lightbox = $('#lightbox');
  let albums = null;
  let album = 'landscapes';
  let shots = [];
  let lbIndex = 0;

  const thumbWidth = (p) => (p.w >= p.h ? Math.min(720, p.w) : Math.round((Math.min(720, p.h) * p.w) / p.h));

  let parallaxTick = false;
  function parallax() {
    parallaxTick = false;
    if (reduced) return;
    const mid = innerWidth / 2;
    for (const s of shots) {
      const r = s.getBoundingClientRect();
      if (r.right < -100 || r.left > innerWidth + 100) continue;
      const off = (r.left + r.width / 2 - mid) / innerWidth;
      s._img.style.transform = `translateX(${(-off * 7).toFixed(2)}%)`;
    }
  }

  const renderAlbum = (name, animate) => {
    const items = albums[name];
    const build = () => {
      gallery.replaceChildren(...items.map((p, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'shot';
        b.style.setProperty('--ar', `${p.w} / ${p.h}`);
        const no = `No. ${String(i + 1).padStart(2, '0')}`;
        b.setAttribute('aria-label', `Open photograph ${i + 1} of ${items.length}${p.caption ? `: ${p.caption}` : ''}`);
        const print = document.createElement('span');
        print.className = 'print';
        const pic = document.createElement('span');
        pic.className = 'pic';
        const img = new Image();
        img.alt = p.caption || `Photograph by Devgna Vyas, ${name === 'animals' ? 'animals' : 'places'} ${i + 1}`;
        img.decoding = 'async';
        img.loading = i < 4 ? 'eager' : 'lazy';
        img.width = p.w; img.height = p.h;
        img.sizes = `calc(${(p.w / p.h).toFixed(3)} * min(50vh, 560px))`;
        img.srcset = `${p.thumb} ${thumbWidth(p)}w, ${p.src} ${p.w}w`;
        img.src = p.thumb;
        img.dataset.loading = '';
        img.addEventListener('load', () => img.removeAttribute('data-loading'), { once: true });
        pic.append(img); print.append(pic);
        const plaque = document.createElement('span');
        plaque.className = 'plaque';
        const nb = document.createElement('b'); nb.textContent = no;
        const cap = document.createElement('span'); cap.textContent = p.caption || (name === 'animals' ? 'Animals' : 'Untitled');
        plaque.append(nb, cap);
        b.append(print, plaque);
        b._img = img;
        b.addEventListener('click', () => openLightbox(i));
        return b;
      }));
      shots = $$('.shot', gallery);
      gallery.scrollLeft = 0;
      parallax();
      if (animate && motion) gsap.from(shots.slice(0, 5), { y: 50, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.07 });
      if (ST) ST.refresh();
    };
    if (animate && motion && shots.length) gsap.to(shots.slice(0, 5), { y: -24, opacity: 0, duration: 0.3, ease: 'power2.in', stagger: 0.03, onComplete: build });
    else build();
  };

  gallery.addEventListener('scroll', () => { if (!parallaxTick) { parallaxTick = true; requestAnimationFrame(parallax); } }, { passive: true });
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
      v = ((lastX - e.clientX) / Math.max(1, now - lastT)) * 16;
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

  // Segmented control with a sliding thumb.
  const seg = $('.seg');
  const placeThumb = () => {
    const on = $('[aria-selected="true"]', seg);
    seg.style.setProperty('--x', `${on.offsetLeft}px`);
    seg.style.setProperty('--w', `${on.offsetWidth}px`);
  };
  window.addEventListener('resize', placeThumb, { passive: true });
  if (document.fonts) document.fonts.ready.then(placeThumb);
  placeThumb();
  $$('[role="tab"][data-album]').forEach((tab, _, tabs) => {
    tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1;
    tab.addEventListener('click', () => {
      if (!albums || tab.dataset.album === album) return;
      album = tab.dataset.album;
      gallery.setAttribute('aria-labelledby', tab.id);
      tabs.forEach((t) => { t.setAttribute('aria-selected', String(t === tab)); t.tabIndex = t === tab ? 0 : -1; });
      placeThumb();
      tap();
      renderAlbum(album, true);
    });
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
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
      placeThumb();
      renderAlbum(album, false);
    } catch {
      // Keep the committed photo links when the optional JSON request fails.
      gallery.dataset.offline = 'true';
    }
  };
  if ('IntersectionObserver' in window) new IntersectionObserver(([e], obs) => { if (e.isIntersecting) { obs.disconnect(); loadGallery(); } }, { rootMargin: '900px 0px' }).observe(gallery);
  else loadGallery();

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
      lbIndexEl.textContent = `No. ${String(lbIndex + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
      [items[(lbIndex + 1) % items.length], items[(lbIndex - 1 + items.length) % items.length]].forEach((n) => { new Image().src = n.src; });
    };
    if (dir && motion) {
      gsap.to(lbImg, { x: -dir * 50, opacity: 0, duration: 0.2, ease: 'power2.in', onComplete: () => { set(); gsap.fromTo(lbImg, { x: dir * 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }); } });
    } else set();
  };
  function openLightbox(i) {
    showPhoto(i);
    lightbox.showModal();
    lockScroll(true);
    const from = shots[i] && $('.print', shots[i]).getBoundingClientRect();
    if (motion && from) {
      requestAnimationFrame(() => {
        const to = lbImg.getBoundingClientRect();
        if (!to.width) return;
        gsap.from(lbImg, {
          x: from.left + from.width / 2 - (to.left + to.width / 2),
          y: from.top + from.height / 2 - (to.top + to.height / 2),
          scale: Math.max(from.width / to.width, from.height / to.height),
          duration: 0.75, ease: 'expo.out', clearProps: 'transform'
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
      ['Writing', 'Section', go('writing')],
      ['About', 'Section', go('about')],
      ['Photography', 'Section', go('photography')],
      ['Contact', 'Section', go('contact')],
      ['Copy email address', 'Action', () => copyEmail()],
      ['Send an email', 'Action', () => { location.href = `mailto:${EMAIL}`; }],
      ['Toggle light / dark', 'Action', () => toggleTheme()],
      ['GitHub — @vyas-devgna', 'Link', open('https://github.com/vyas-devgna')],
      ['LinkedIn — devgna-vyas', 'Link', open('https://linkedin.com/in/devgna-vyas')],
      ['Blog — Notes on software and systems', 'Link', () => { location.href = 'https://blog.vyasdevgna.online/'; }],
      ...$$('.tile').map((a) => [`${$('h3', a).textContent} — ${$('.t-copy > p:not(.t-cat):not(.t-tags)', a).textContent}`, 'Project', open(a.href)]),
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
    window.addEventListener('keydown', (e) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
      if ((e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing && !lightbox.open)) { e.preventDefault(); show(); }
    });
  })();


  /* ---------- pointer spotlight: a soft light that follows the cursor over tiles and cards ---------- */
  if (fine && !reduced) {
    $$('.tile, .card, .contact-links a, .post-feature, .post-row').forEach((el) => {
      el.classList.add('spot');
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      }, { passive: true });
    });
  }

  /* ---------- images: fade in once decoded ---------- */
  $$('.t-media > img, .frame-mat img').forEach((img) => {
    if (img.complete && img.naturalWidth) return;
    img.classList.add('is-loading');
    const done = () => img.classList.remove('is-loading');
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  });

  /* ---------- writing: live from the blog (recent + best) ---------- */
  (() => {
    const section = $('#writing');
    const body = $('#writing-body');
    if (!section || !body) return;
    const apiUrl = () => section.dataset.api;
    const fmt = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' });
    const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
    const safeUrl = (u) => { try { const x = new URL(u, apiUrl()); return x.protocol === 'https:' || (x.protocol === 'http:' && x.hostname === 'localhost') ? x.href : null; } catch { return null; } };
    const safeCover = (c) => (typeof c === 'string' && (c.startsWith('data:image/svg+xml,') || /^https:\/\//.test(c)) ? c : null);

    const meta = (post) => {
      const m = el('span', 'post-meta');
      if (post.tags && post.tags[0]) m.append(el('b', null, post.tags[0]));
      const t = el('time', null, fmt.format(new Date(post.publishedAt)));
      t.dateTime = post.publishedAt;
      m.append(t, el('span', null, `${post.readingTime} min read`));
      return m;
    };

    const feature = (post, badge) => {
      const a = el('a', 'post-feature');
      a.href = safeUrl(post.url) || '#';
      a.rel = 'noopener';
      const cover = safeCover(post.cover);
      const media = el('span', 'post-cover');
      if (cover) { const img = new Image(); img.src = cover; img.alt = ''; img.width = 1200; img.height = 760; img.loading = 'lazy'; img.decoding = 'async'; media.append(img); }
      media.append(el('span', 'post-badge', badge));
      a.append(media, meta(post), el('strong', 'post-title', post.title), el('span', 'post-desc', post.description), el('span', 'more', 'Read the essay'));
      return a;
    };

    const row = (post, i) => {
      const li = el('li');
      const a = el('a', 'post-row');
      a.href = safeUrl(post.url) || '#';
      a.rel = 'noopener';
      const text = el('span', 'post-row-text');
      text.append(el('strong', null, post.title), meta(post));
      a.append(el('span', 'post-no', String(i + 1).padStart(2, '0')), text, el('i', null, '↗'));
      li.append(a);
      return li;
    };

    const render = (data) => {
      const featured = Array.isArray(data.featured) ? data.featured : [];
      const recent = Array.isArray(data.recent) ? data.recent : [];
      if (!featured.length && !recent.length) return false;
      const best = featured[0] || recent[0];
      const rest = recent.filter((p) => p.slug !== best.slug).slice(0, 4);

      const grid = el('div', 'writing-grid');
      const left = el('div', 'writing-col');
      left.append(el('h3', 'writing-heading', featured.length ? 'Best of' : 'Latest'), feature(best, featured.length ? 'Featured' : 'New'));
      grid.append(left);
      if (rest.length) {
        const right = el('div', 'writing-col');
        const list = el('ol', 'post-list');
        rest.forEach((p, i) => list.append(row(p, i)));
        right.append(el('h3', 'writing-heading', 'Recent'), list);
        grid.append(right);
      }
      body.replaceChildren(grid);
      if (fine && !reduced) $$('.post-feature, .post-row', body).forEach((n) => {
        n.classList.add('spot');
        n.addEventListener('pointermove', (e) => { const r = n.getBoundingClientRect(); n.style.setProperty('--mx', `${e.clientX - r.left}px`); n.style.setProperty('--my', `${e.clientY - r.top}px`); }, { passive: true });
      });
      if (motion) gsap.from($$('.writing-heading, .post-feature, .post-row', body), { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07, clearProps: 'all', scrollTrigger: { trigger: body, start: 'top 88%', once: true } });
      if (ST) ST.refresh();
      return true;
    };

    const load = async () => {
      const api = apiUrl();
      if (!api) return;
      body.setAttribute('aria-busy', 'true');
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 7000);
      try {
        const res = await fetch(api, { signal: ctl.signal, headers: { accept: 'application/json' } });
        if (!res.ok) throw new Error(String(res.status));
        render(await res.json());
      } catch {
        /* keep the designed empty state — it links to the blog */
      } finally {
        clearTimeout(timer);
        body.setAttribute('aria-busy', 'false');
      }
    };
    let started = false;
    const start = () => { if (started) return; started = true; io.disconnect(); load(); };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) start(); }, { rootMargin: '600px 0px' });
    io.observe(section);
    // The feed is a few KB: fetch it when the browser is idle so it's ready before anyone scrolls here.
    const schedule = () => setTimeout(start, 2500);
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });
  })();

  /* ---------- hero: the headline drifts a few pixels against the pointer ---------- */
  if (motion && fine) {
    const copy = $('.hero-copy');
    const hero = $('.hero');
    if (copy && hero) {
      const xTo = gsap.quickTo(copy, 'x', { duration: 1.2, ease: 'power3' });
      const yTo = gsap.quickTo(copy, 'y', { duration: 1.2, ease: 'power3' });
      hero.addEventListener('pointermove', (e) => {
        xTo(-(e.clientX / innerWidth - 0.5) * 14);
        yTo(-(e.clientY / innerHeight - 0.5) * 10);
      }, { passive: true });
      hero.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    }
  }

  /* ---------- motion layer (GSAP): Apple-style scroll choreography ---------- */
  const intro = () => {
    if (!motion) return;
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from('.hero-art', { opacity: 0, scale: 1.08, duration: 2.2, ease: 'power2.out' }, 0)
      .from('.eyebrow', { y: 16, opacity: 0, duration: 1.1 }, 0.2)
      .from('.hero h1 .line', { yPercent: 12, duration: 1, stagger: 0.06 }, 0.3)
      .from('.hero-intro, .hero-cta > *', { y: 22, opacity: 0, duration: 1.2, stagger: 0.08 }, 0.75)
      .from('.gnav', { yPercent: -100, duration: 1.1 }, 0.1);
  };

  const scrollMotion = () => {
    if (!motion) return;

    // The painting shrinks into a framed canvas as the page takes over.
    const shrink = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
    shrink.fromTo('.hero-art', { clipPath: 'inset(0% 0% 0% 0% round 0px)' }, { clipPath: 'inset(9% 7% 9% 7% round 36px)', ease: 'none' }, 0)
      .to('.hero-copy', { yPercent: -14, opacity: 0, ease: 'none' }, 0.15);

    // Keep paragraph text and headings in their semantic DOM, at full contrast.
    // Labels, ledes and tiles rise into place.
    $$('.label, .lede').forEach((el) => gsap.from(el, { y: 18, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
    const rise = $$('.rise, .notes-head, .notes-deck, .album-bar, .mail-row, .contact-links a, .links-row');
    gsap.set(rise, { y: 60, opacity: 0 });
    ST.batch(rise, { start: 'top 92%', once: true, onEnter: (b) => gsap.to(b, { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', stagger: 0.09, overwrite: true }) });

    // Count-ups.
    $$('[data-count]').forEach((el) => {
      const end = parseFloat(el.dataset.count);
      const dec = Number(el.dataset.decimals || 0);
      const o = { v: 0 };
      ST.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.8, ease: 'expo.out', onUpdate: () => { el.textContent = o.v.toFixed(dec); } }) });
    });

    // Tile media drift inside their frames.
    $$('.t-media').forEach((m) => {
      const inner = m.firstElementChild;
      gsap.fromTo(inner, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: m, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // The keynote band fades in from the page.
    gsap.from('.hermes-viz', { scale: 0.94, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.hermes', start: 'top 78%', once: true } });

    // Portrait: hung on the wall with a slow settle.
    gsap.from('.frame', { y: 80, rotation: -1.5, opacity: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.frame', start: 'top 85%', once: true } });
    gsap.fromTo('.frame-mat img', { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.frame', start: 'top bottom', end: 'bottom 30%', scrub: true } });
  };

  const fonts = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]) : Promise.resolve();
  fonts.then(() => {
    intro();
    scrollMotion();
    if (location.hash) scrollToTarget(document.getElementById(location.hash.slice(1)), true);
    if (ST) ST.refresh();
  });
})();
