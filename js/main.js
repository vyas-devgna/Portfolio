const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function initTheme() {
  const root = document.documentElement;
  const button = $('#theme-toggle');
  const stored = localStorage.getItem('portfolio-theme');
  if (stored === 'light' || stored === 'dark') root.dataset.theme = stored;

  button?.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    localStorage.setItem('portfolio-theme', next);
  });
}

function initHeader() {
  const header = $('#site-header');
  const menuTrigger = $('#menu-trigger');
  const mobileNav = $('#mobile-nav');

  const update = () => header?.classList.toggle('scrolled', window.scrollY > 16);
  update();
  window.addEventListener('scroll', update, { passive: true });

  menuTrigger?.addEventListener('click', () => {
    const open = menuTrigger.getAttribute('aria-expanded') === 'true';
    menuTrigger.setAttribute('aria-expanded', String(!open));
    mobileNav.hidden = open;
  });

  $$('#mobile-nav a').forEach((link) => link.addEventListener('click', () => {
    if (!mobileNav || !menuTrigger) return;
    mobileNav.hidden = true;
    menuTrigger.setAttribute('aria-expanded', 'false');
  }));
}

function initScrollProgress() {
  const bar = $('#scroll-progress');
  if (!bar) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    bar.style.height = `${clamp(ratio, 0, 1) * 100}%`;
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
}

function initTelemetry() {
  const time = $('#local-time');
  const year = $('#year');
  const role = $('#rotating-role');
  const roles = ['NETWORK SYSTEMS', 'LOCAL-FIRST SOFTWARE', 'AI ENGINEERING', 'SECURITY RESEARCH', 'OPEN SOURCE'];
  let roleIndex = 0;

  if (year) year.textContent = String(new Date().getFullYear());

  const tick = () => {
    if (!time) return;
    time.textContent = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).format(new Date());
  };
  tick();
  setInterval(tick, 1000);

  if (role) setInterval(() => {
    roleIndex = (roleIndex + 1) % roles.length;
    role.animate([{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 320, easing: 'ease-out' });
    role.textContent = roles[roleIndex];
  }, 2600);
}

function formatRelative(dateString) {
  const ms = Date.now() - new Date(dateString).getTime();
  const days = Math.max(0, Math.floor(ms / 86400000));
  if (days === 0) return 'TODAY';
  if (days === 1) return '1D AGO';
  if (days < 30) return `${days}D AGO`;
  const months = Math.floor(days / 30);
  return `${months}MO AGO`;
}

function repoCard(repo) {
  const card = document.createElement('a');
  card.className = 'repo-card';
  card.href = repo.html_url;
  card.target = '_blank';
  card.rel = 'noopener';

  const top = document.createElement('div');
  top.className = 'repo-card-top';
  const visibility = document.createElement('span');
  visibility.textContent = repo.archived ? 'ARCHIVED' : 'PUBLIC';
  const updated = document.createElement('span');
  updated.textContent = `UPDATED ${formatRelative(repo.updated_at)}`;
  top.append(visibility, updated);

  const title = document.createElement('h3');
  title.textContent = repo.name;
  const description = document.createElement('p');
  description.textContent = repo.description || 'Open-source experiment. Inspect the repository for the interesting part.';

  const meta = document.createElement('div');
  meta.className = 'repo-meta';
  const language = document.createElement('span');
  const dot = document.createElement('i');
  language.append(dot, document.createTextNode(repo.language || 'Mixed'));
  const stars = document.createElement('span');
  stars.textContent = `★ ${repo.stargazers_count}`;
  const forks = document.createElement('span');
  forks.textContent = `⑂ ${repo.forks_count}`;
  meta.append(language, stars, forks);

  card.append(top, title, description, meta);
  return card;
}

async function loadGitHub() {
  const grid = $('#repo-grid');
  const state = $('#repo-fetch-state');
  const heroStatus = $('#github-status');
  if (!grid) return;

  try {
    const [profileResponse, repoResponse] = await Promise.all([
      fetch('https://api.github.com/users/vyas-devgna', { headers: { Accept: 'application/vnd.github+json' } }),
      fetch('https://api.github.com/users/vyas-devgna/repos?sort=updated&per_page=24', { headers: { Accept: 'application/vnd.github+json' } })
    ]);
    if (!profileResponse.ok || !repoResponse.ok) throw new Error('GitHub API unavailable');
    const profile = await profileResponse.json();
    const repos = await repoResponse.json();
    const selected = repos.filter((repo) => !repo.fork && !repo.archived && repo.name.toLowerCase() !== 'portfolio').slice(0, 4);

    grid.replaceChildren(...selected.map(repoCard));
    if (state) state.textContent = `${selected.length} RECENT / LIVE`;
    if (heroStatus) heroStatus.textContent = `${profile.public_repos} REPOS / ONLINE`;
  } catch (error) {
    if (state) state.textContent = 'API DEGRADED / FALLBACK';
    if (heroStatus) heroStatus.textContent = 'PUBLIC / AVAILABLE';
    grid.replaceChildren();
    const fallback = [
      ['Braids', 'Engineering-rigor tooling and experiments around reliable AI-assisted software development.'],
      ['LIWM', 'Intent and memory architecture experiments for agentic engineering workflows.'],
      ['Omarchy Connect', 'Connectivity experiments for Linux desktops and mobile devices.'],
      ['EzBoard', 'Local-first collaborative canvas for people and AI agents.']
    ];
    fallback.forEach(([name, description]) => {
      const card = document.createElement('a');
      card.className = 'repo-card';
      card.href = `https://github.com/vyas-devgna/${name.toLowerCase().replaceAll(' ', '-')}`;
      card.target = '_blank';
      card.rel = 'noopener';
      const top = document.createElement('div'); top.className = 'repo-card-top'; top.innerHTML = '<span>GITHUB</span><span>FALLBACK INDEX</span>';
      const h3 = document.createElement('h3'); h3.textContent = name;
      const p = document.createElement('p'); p.textContent = description;
      card.append(top, h3, p);
      grid.append(card);
    });
  }
}

function initCommandPalette() {
  const dialog = $('#command-palette');
  const trigger = $('#command-trigger');
  const input = $('#command-input');
  const results = $('#command-results');
  if (!dialog || !input || !results) return;

  const commands = [
    { id: '01', label: 'Selected work', hint: 'SECTION', target: '#work' },
    { id: '02', label: 'Live GitHub lab', hint: 'SECTION', target: '#lab' },
    { id: '03', label: 'Open source work', hint: 'SECTION', target: '#open-source' },
    { id: '04', label: 'HERMES research', hint: 'SECTION', target: '#research' },
    { id: '05', label: 'Engineering stack', hint: 'SECTION', target: '#stack' },
    { id: '06', label: 'Contact Devgna', hint: 'EMAIL', target: 'mailto:vyasdevgna@gmail.com' },
    { id: 'P1', label: 'EzBoard', hint: 'PROJECT', target: 'https://github.com/vyas-devgna/ezboard' },
    { id: 'P2', label: 'Same.Energy Android', hint: 'PROJECT', target: 'https://github.com/vyas-devgna/same-energy-android' },
    { id: 'P3', label: 'ez-drop', hint: 'PROJECT', target: 'https://github.com/vyas-devgna/ez-drop' },
    { id: 'GH', label: 'GitHub profile', hint: 'EXTERNAL', target: 'https://github.com/vyas-devgna' },
    { id: 'LI', label: 'LinkedIn', hint: 'EXTERNAL', target: 'https://linkedin.com/in/devgna-vyas' }
  ];
  let visible = commands;
  let active = 0;

  const openTarget = (target) => {
    dialog.close();
    if (target.startsWith('#')) {
      document.querySelector(target)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    } else if (target.startsWith('mailto:')) {
      window.location.href = target;
    } else {
      window.open(target, '_blank', 'noopener');
    }
  };

  const render = () => {
    results.replaceChildren();
    visible.forEach((command, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `command-item${index === active ? ' active' : ''}`;
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', String(index === active));
      const id = document.createElement('b'); id.textContent = command.id;
      const label = document.createElement('span'); label.textContent = command.label;
      const hint = document.createElement('span'); hint.textContent = command.hint;
      button.append(id, label, hint);
      button.addEventListener('click', () => openTarget(command.target));
      results.append(button);
    });
  };

  const open = () => {
    if (!dialog.open) dialog.showModal();
    input.value = '';
    visible = commands;
    active = 0;
    render();
    requestAnimationFrame(() => input.focus());
  };

  trigger?.addEventListener('click', open);
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      open();
    }
    if (!dialog.open) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); active = (active + 1) % Math.max(visible.length, 1); render(); }
    if (event.key === 'ArrowUp') { event.preventDefault(); active = (active - 1 + Math.max(visible.length, 1)) % Math.max(visible.length, 1); render(); }
    if (event.key === 'Enter' && visible[active]) { event.preventDefault(); openTarget(visible[active].target); }
  });

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    visible = commands.filter((command) => `${command.label} ${command.hint}`.toLowerCase().includes(query));
    active = 0;
    render();
  });
  render();
}

function initPointerEffects() {
  if (!finePointer || reducedMotion) return;
  const glow = $('#cursor-glow');
  const portrait = $('#hero-visual');

  window.addEventListener('pointermove', (event) => {
    if (glow) glow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
  }, { passive: true });

  portrait?.addEventListener('pointermove', (event) => {
    const rect = portrait.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    portrait.style.transform = `perspective(900px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
  });
  portrait?.addEventListener('pointerleave', () => portrait.style.transform = '');

  $$('.magnetic').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      element.style.transform = `translate3d(${x * .12}px, ${y * .12}px, 0)`;
    });
    element.addEventListener('pointerleave', () => element.style.transform = '');
  });

  $$('.project-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      card.style.transform = `perspective(1200px) rotateX(${-y * 1.2}deg) rotateY(${x * 1.2}deg) translateZ(0)`;
    });
    card.addEventListener('pointerleave', () => card.style.transform = '');
  });
}

function scramble(element, finalText, duration = 700) {
  if (reducedMotion) return;
  const glyphs = '01<>[]{}\/|*#@$%';
  const start = performance.now();
  const tick = (now) => {
    const progress = clamp((now - start) / duration, 0, 1);
    const reveal = Math.floor(finalText.length * progress);
    let output = '';
    for (let i = 0; i < finalText.length; i += 1) {
      if (finalText[i] === ' ') output += ' ';
      else if (i < reveal) output += finalText[i];
      else output += glyphs[Math.floor(Math.random() * glyphs.length)];
    }
    element.textContent = output;
    if (progress < 1) requestAnimationFrame(tick);
    else element.textContent = finalText;
  };
  requestAnimationFrame(tick);
}

function initScramble() {
  $$('.hero-line[data-scramble]').forEach((line, index) => {
    const text = line.dataset.scramble;
    setTimeout(() => scramble(line, text, 700 + index * 140), 260 + index * 100);
    line.addEventListener('pointerenter', () => scramble(line, text, 420));
  });
}

function initSignalField() {
  const canvas = $('#signal-field');
  const hero = $('#top');
  if (!canvas || !hero || reducedMotion) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let frame = 0;
  let running = true;
  const pointer = { x: .68, y: .36, active: false };
  let nodes = [];

  const resize = () => {
    const rect = hero.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = clamp(Math.round(width / 52), 15, 34);
    nodes = Array.from({ length: count }, (_, index) => ({
      x: (index / count) * width + Math.random() * 40,
      y: height * (.12 + Math.random() * .76),
      baseY: height * (.12 + Math.random() * .76),
      phase: Math.random() * Math.PI * 2,
      speed: .00025 + Math.random() * .00045,
      size: 1 + Math.random() * 1.8
    }));
  };

  const draw = (time) => {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);
    const style = getComputedStyle(document.documentElement);
    const line = style.getPropertyValue('--line-strong').trim() || 'rgba(236,241,245,.2)';
    const accent = style.getPropertyValue('--cyan').trim() || '#6ae4ff';

    nodes.forEach((node, index) => {
      node.y = node.baseY + Math.sin(time * node.speed + node.phase) * 30;
      node.x += .055 + (index % 3) * .015;
      if (node.x > width + 20) node.x = -20;

      const px = pointer.x * width;
      const py = pointer.y * height;
      const dx = node.x - px;
      const dy = node.y - py;
      const distance = Math.hypot(dx, dy);
      if (pointer.active && distance < 160 && distance > 0) {
        const force = (160 - distance) / 160;
        node.x += (dx / distance) * force * 1.25;
        node.y += (dy / distance) * force * 1.25;
      }
    });

    for (let a = 0; a < nodes.length; a += 1) {
      for (let b = a + 1; b < nodes.length; b += 1) {
        const one = nodes[a];
        const two = nodes[b];
        const dist = Math.hypot(one.x - two.x, one.y - two.y);
        if (dist > 128) continue;
        ctx.globalAlpha = (1 - dist / 128) * .52;
        ctx.strokeStyle = line;
        ctx.lineWidth = .7;
        ctx.beginPath();
        ctx.moveTo(one.x, one.y);
        ctx.lineTo(two.x, two.y);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = .8;
    ctx.fillStyle = accent;
    nodes.forEach((node) => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    frame = requestAnimationFrame(draw);
  };

  const observer = new IntersectionObserver(([entry]) => {
    running = entry.isIntersecting;
    cancelAnimationFrame(frame);
    if (running) frame = requestAnimationFrame(draw);
  }, { threshold: .01 });
  observer.observe(hero);

  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    pointer.x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    pointer.y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    pointer.active = true;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => pointer.active = false);
  window.addEventListener('resize', resize, { passive: true });
  resize();
  frame = requestAnimationFrame(draw);
}

async function initMotionLayer() {
  if (reducedMotion) return;
  try {
    const [motionModule, lenisModule] = await Promise.all([import('motion'), import('lenis')]);
    const { animate, inView, stagger } = motionModule;
    const Lenis = lenisModule.default;

    const lenis = new Lenis({ duration: 1.05, smoothWheel: true, touchMultiplier: 1.1, wheelMultiplier: .9 });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);

    inView('.reveal-row', (element) => {
      animate(element, { opacity: [0, 1], y: [26, 0] }, { duration: .75, ease: [0.22, 1, 0.36, 1] });
    }, { margin: '-8% 0px -10% 0px' });

    inView('.project-card', (element) => {
      const pieces = element.querySelectorAll('.project-topline, h3, p, .architecture-strip, .project-link');
      animate(pieces, { opacity: [0, 1], y: [18, 0] }, { delay: stagger(.045), duration: .6, ease: [0.22, 1, 0.36, 1] });
    }, { margin: '-6% 0px -8% 0px' });

    inView('.reveal-text', (element) => {
      animate(element, { opacity: [0, 1], y: [38, 0], filter: ['blur(5px)', 'blur(0px)'] }, { duration: .9, ease: [0.22, 1, 0.36, 1] });
    }, { margin: '-8% 0px -12% 0px' });
  } catch (error) {
    console.info('Motion enhancement unavailable; native experience remains active.', error);
  }
}

initTheme();
initHeader();
initScrollProgress();
initTelemetry();
initCommandPalette();
initPointerEffects();
initScramble();
initSignalField();
loadGitHub();
initMotionLayer();
