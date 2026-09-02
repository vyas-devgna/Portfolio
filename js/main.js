const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scenes = [...document.querySelectorAll('.scene')];
const sceneLinks = [...document.querySelectorAll('[data-scene-link]')];
const desktopNav = [...document.querySelectorAll('.desktop-nav [data-scene-link]')];
const railButtons = [...document.querySelectorAll('.scene-rail [data-scene-link]')];
const currentLabel = document.getElementById('scene-current');
const menuButton = document.getElementById('menu-button');
const mobileMenu = document.getElementById('mobile-menu');
let sceneIndex = 0;
let sceneLocked = false;
let touchStartY = 0;
let photographyLoaded = false;

const projects = [
  {
    title: 'Touchstone',
    kind: 'RECONCILIATION CONTROLLER',
    status: 'PUBLIC / 2026',
    desc: 'A reconciliation controller for autonomous scrapers that distinguishes a broken extraction from a genuinely changed world before allowing repair.',
    points: [
      'Independent structural channels instead of one fragile signal',
      'Separates extraction drift, world drift and confounded states',
      '119 passing tests and explicit false-heal benchmarks'
    ],
    tags: ['PYTHON', 'RECONCILIATION', 'AUTONOMY SAFETY'],
    repo: 'https://github.com/vyas-devgna/touchstone',
    live: 'https://vyas-devgna.github.io/touchstone/',
    image: null,
    mark: 'TOUCHSTONE',
    submark: 'WORLD DRIFT ≠ EXTRACTION DRIFT'
  },
  {
    title: 'Braids',
    kind: 'AI ENGINEERING GOVERNANCE',
    status: 'PUBLIC / 2026',
    desc: 'Adaptive engineering governance for AI coding agents: a rigor layer for evidence, edge cases, failure paths, verification and resource trade-offs.',
    points: [
      'Cross-agent packaging for major coding-agent ecosystems',
      'Engineering decisions are evidence-gated rather than style-gated',
      'Designed to preserve rigor without rewarding code volume'
    ],
    tags: ['PYTHON', 'AGENT SKILLS', 'GOVERNANCE'],
    repo: 'https://github.com/vyas-devgna/braids',
    live: null,
    image: 'https://raw.githubusercontent.com/vyas-devgna/braids/main/assets/hero/braids-hero.png',
    cover: false
  },
  {
    title: 'LIWM',
    kind: 'AGENT MEMORY / INTENT INFRASTRUCTURE',
    status: 'PUBLIC / 2026',
    desc: 'Provenance-gated, auditable memory for coding agents: where a remembered preference came from, how certain it is, and which scope it belongs to.',
    points: [
      'Local-first evidence and provenance instead of opaque memory',
      'Scope isolation, confidence and rebuildable projections',
      'Designed for Claude Code, Codex, Gemini CLI, Cursor and AGENTS.md agents'
    ],
    tags: ['PYTHON', 'LOCAL FIRST', 'PROVENANCE'],
    repo: 'https://github.com/vyas-devgna/liwm-agent-framework',
    live: null,
    image: 'https://raw.githubusercontent.com/vyas-devgna/liwm-agent-framework/main/assets/social-preview.png',
    cover: true
  },
  {
    title: 'Omarchy Connect',
    kind: 'DEVICE CONTINUITY / NETWORKING',
    status: 'PRIVATE BUILD / 2026',
    desc: 'A local-first Android ↔ Omarchy continuity system derived from KDE Connect, extending an existing paired trust relationship across the internet without accounts or a second QR flow.',
    points: [
      'Cross-binds authenticated KDE certificates to pinned Iroh EndpointIDs',
      'Separates pairing, reachability, transport and user authentication',
      'Local keys, QUIC-encrypted content and explicit re-enrollment on identity rotation'
    ],
    tags: ['RUST', 'KDE CONNECT', 'IROH / QUIC'],
    repo: null,
    live: null,
    image: null,
    mark: 'OMARCHY CONNECT',
    submark: 'KDE TRUST × IROH REACHABILITY'
  },
  {
    title: 'Fin',
    kind: 'OFFLINE-FIRST PERSONAL FINANCE',
    status: 'PUBLIC / 2026',
    desc: 'A deliberately calm money app that keeps the complete ledger on-device and reduces personal finance to a small, explicit vocabulary of money movements.',
    points: [
      'IndexedDB storage with no account and no runtime server',
      'Integer-paise arithmetic to avoid floating-point money errors',
      'Budgets, goals, debt, recurrence and six derived insight views'
    ],
    tags: ['VANILLA JS', 'INDEXEDDB', 'PWA'],
    repo: 'https://github.com/vyas-devgna/fin',
    live: 'https://fin.vyasdevgna.online',
    image: 'https://raw.githubusercontent.com/vyas-devgna/fin/main/icons/logo.svg',
    cover: false
  },
  {
    title: 'EzBoard',
    kind: 'LOCAL-FIRST COLLABORATIVE CANVAS',
    status: 'PUBLIC / 2026',
    desc: 'A private infinite canvas where people and AI agents can diagram, brainstorm and wireframe together without accounts or a hosted board database.',
    points: [
      'Encrypted WebRTC data channels for direct peer collaboration',
      'Nostr used for discovery while board state remains local',
      'Provider-neutral agent protocol for validated Excalidraw actions'
    ],
    tags: ['REACT', 'WEBRTC', 'EXCALIDRAW'],
    repo: 'https://github.com/vyas-devgna/ezboard',
    live: 'https://ezboard.vyasdevgna.online',
    image: 'https://raw.githubusercontent.com/vyas-devgna/ezboard/main/public/brand/ezboard-mark.png',
    cover: false
  },
  {
    title: 'Same.Energy Android',
    kind: 'MOBILE CLIENT ENGINEERING',
    status: 'PUBLIC / 2026',
    desc: 'A Flutter client for Same.Energy focused on translating a visual-search experience into a responsive, gesture-driven mobile application.',
    points: [
      'Riverpod state boundaries and GoRouter navigation',
      'Asynchronous image loading, caching and masonry-style browsing',
      'Mobile interaction designed around gestures rather than a web wrapper'
    ],
    tags: ['FLUTTER', 'DART', 'RIVERPOD'],
    repo: 'https://github.com/vyas-devgna/same-energy-android',
    live: null,
    image: 'https://raw.githubusercontent.com/vyas-devgna/same-energy-android/main/assets/blacklogo-bg.png',
    cover: false
  },
  {
    title: 'Mumbai TripOS',
    kind: 'STATIC TRIP OPERATING SYSTEM',
    status: 'PUBLIC / 2026',
    desc: 'A mobile-first group-trip operating dashboard where GitHub is the source of truth and deployments update an installed PWA without any runtime backend.',
    points: [
      'ChatGPT → GitHub data → React/Vite → GitHub Pages workflow',
      'Offline vault, service-worker updates and cached map resources',
      'MapLibre trip visualization with external navigation deep links'
    ],
    tags: ['REACT', 'PWA', 'MAPLIBRE'],
    repo: 'https://github.com/vyas-devgna/mumbai-trip',
    live: null,
    image: 'https://raw.githubusercontent.com/vyas-devgna/mumbai-trip/main/public/icon.svg',
    cover: false
  }
];

function updateSceneUI(index) {
  sceneLinks.forEach((button) => button.classList.toggle('active', Number(button.dataset.sceneLink) === index));
  desktopNav.forEach((button) => button.classList.toggle('active', Number(button.dataset.sceneLink) === index));
  railButtons.forEach((button) => button.classList.toggle('active', Number(button.dataset.sceneLink) === index));
  if (currentLabel) currentLabel.textContent = String(index + 1).padStart(2, '0');
}

function applyScene(index, direction = 1) {
  const oldScene = scenes[sceneIndex];
  const newScene = scenes[index];
  if (!newScene || index === sceneIndex) return;
  oldScene?.classList.add('exiting');
  oldScene?.classList.remove('active');
  newScene.style.setProperty('--scene-direction', direction);
  newScene.classList.add('active');
  newScene.classList.remove('exiting');
  sceneIndex = index;
  updateSceneUI(index);
  if (index === 4) loadPhotography();
  window.setTimeout(() => oldScene?.classList.remove('exiting'), 650);
}

function goToScene(index) {
  const next = Math.max(0, Math.min(scenes.length - 1, index));
  if (next === sceneIndex || sceneLocked) return;
  sceneLocked = true;
  const direction = next > sceneIndex ? 1 : -1;
  const mutate = () => applyScene(next, direction);
  if (!reducedMotion && document.startViewTransition) document.startViewTransition(mutate);
  else mutate();
  window.setTimeout(() => { sceneLocked = false; }, reducedMotion ? 20 : 560);
  closeMenu();
}

sceneLinks.forEach((button) => button.addEventListener('click', () => goToScene(Number(button.dataset.sceneLink))));

window.addEventListener('wheel', (event) => {
  if (Math.abs(event.deltaY) < 26 || sceneLocked) return;
  goToScene(sceneIndex + (event.deltaY > 0 ? 1 : -1));
}, { passive: true });

window.addEventListener('touchstart', (event) => {
  touchStartY = event.changedTouches[0]?.clientY ?? 0;
}, { passive: true });
window.addEventListener('touchend', (event) => {
  const end = event.changedTouches[0]?.clientY ?? touchStartY;
  const delta = touchStartY - end;
  if (Math.abs(delta) > 54) goToScene(sceneIndex + (delta > 0 ? 1 : -1));
}, { passive: true });

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowDown' || event.key === 'PageDown') { event.preventDefault(); goToScene(sceneIndex + 1); }
  if (event.key === 'ArrowUp' || event.key === 'PageUp') { event.preventDefault(); goToScene(sceneIndex - 1); }
  if (event.key === 'Home') { event.preventDefault(); goToScene(0); }
  if (event.key === 'End') { event.preventDefault(); goToScene(scenes.length - 1); }
});

function closeMenu() {
  if (!mobileMenu || !menuButton) return;
  mobileMenu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
}
menuButton?.addEventListener('click', () => {
  if (!mobileMenu) return;
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  mobileMenu.hidden = open;
  menuButton.setAttribute('aria-expanded', String(!open));
});

const projectTabs = [...document.querySelectorAll('[data-project]')];
const projectImage = document.getElementById('project-image');
const projectWordmark = document.getElementById('project-wordmark');
const projectKind = document.getElementById('project-kind');
const projectStatus = document.getElementById('project-status');
const projectTitle = document.getElementById('project-title');
const projectDesc = document.getElementById('project-desc');
const projectPoints = document.getElementById('project-points');
const projectTags = document.getElementById('project-tags');
const projectLink = document.getElementById('project-link');
const projectLive = document.getElementById('project-live');

function renderProject(index) {
  const project = projects[index];
  if (!project) return;
  projectTabs.forEach((tab, i) => tab.setAttribute('aria-selected', String(i === index)));
  if (projectKind) projectKind.textContent = project.kind;
  if (projectStatus) projectStatus.textContent = project.status;
  if (projectTitle) projectTitle.textContent = project.title;
  if (projectDesc) projectDesc.textContent = project.desc;

  if (projectPoints) {
    projectPoints.replaceChildren(...project.points.map((point) => {
      const li = document.createElement('li');
      li.textContent = point;
      return li;
    }));
  }
  if (projectTags) {
    projectTags.replaceChildren(...project.tags.map((tag) => {
      const span = document.createElement('span');
      span.textContent = tag;
      return span;
    }));
  }

  if (project.image && projectImage && projectWordmark) {
    projectImage.hidden = false;
    projectImage.src = project.image;
    projectImage.alt = `${project.title} project asset`;
    projectImage.dataset.cover = String(Boolean(project.cover));
    projectWordmark.hidden = true;
  } else if (projectImage && projectWordmark) {
    projectImage.hidden = true;
    projectImage.removeAttribute('src');
    projectWordmark.hidden = false;
    projectWordmark.innerHTML = '';
    const strong = document.createElement('strong'); strong.textContent = project.mark || project.title.toUpperCase();
    const span = document.createElement('span'); span.textContent = project.submark || project.kind;
    projectWordmark.append(strong, span);
  }

  if (projectLink) {
    projectLink.hidden = !project.repo;
    if (project.repo) projectLink.href = project.repo;
  }
  if (projectLive) {
    projectLive.hidden = !project.live;
    if (project.live) projectLive.href = project.live;
  }
}

projectTabs.forEach((tab) => tab.addEventListener('click', () => {
  const index = Number(tab.dataset.project);
  const mutate = () => renderProject(index);
  if (!reducedMotion && document.startViewTransition) document.startViewTransition(mutate);
  else mutate();
}));

async function loadPhotography() {
  if (photographyLoaded) return;
  photographyLoaded = true;
  const ring = document.getElementById('photo-ring');
  const count = document.getElementById('photo-count');
  const caption = document.getElementById('photo-caption');
  if (!ring) return;

  try {
    const response = await fetch('photography.json', { cache: 'force-cache' });
    if (!response.ok) throw new Error('photo index unavailable');
    const photos = (await response.json()).filter((item) => item?.type === 'image' && item?.src);
    if (!photos.length) throw new Error('no photos');
    ring.style.setProperty('--step', `${360 / photos.length}deg`);
    ring.style.setProperty('--radius', `${Math.max(230, Math.min(460, 160 + photos.length * 12))}px`);
    if (count) count.textContent = String(photos.length).padStart(2, '0');
    if (caption) caption.textContent = photos[0].caption || 'A small archive of places, light and things I noticed.';

    photos.forEach((photo, index) => {
      const article = document.createElement('article');
      article.className = 'photo-card';
      article.style.setProperty('--i', index);
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', photo.caption ? `Show caption: ${photo.caption}` : `Photography frame ${index + 1}`);
      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.caption || `Photograph by Devgna Vyas, frame ${index + 1}`;
      img.loading = index < 5 ? 'eager' : 'lazy';
      img.decoding = 'async';
      button.append(img);
      button.addEventListener('click', () => {
        if (caption) caption.textContent = photo.caption || `Frame ${String(index + 1).padStart(2, '0')} / Devgna Vyas`;
      });
      article.append(button);
      ring.append(article);
    });
  } catch {
    if (caption) caption.textContent = 'Photography archive is unavailable right now.';
    if (count) count.textContent = '—';
  }
}

const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());
updateSceneUI(0);
renderProject(0);
