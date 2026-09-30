const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const menuButton = document.getElementById('menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const progress = document.getElementById('scroll-progress');
const sections = [...document.querySelectorAll('main > section[id]')];
const navLinks = [...document.querySelectorAll('.nav-link')];

function closeMenu() {
  if (!mobileMenu || !menuButton) return;
  mobileMenu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.querySelector('span').textContent = 'Menu';
  document.body.classList.remove('menu-open');
}

menuButton?.addEventListener('click', () => {
  if (!mobileMenu) return;
  const opening = menuButton.getAttribute('aria-expanded') !== 'true';
  mobileMenu.hidden = !opening;
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.querySelector('span').textContent = opening ? 'Close' : 'Menu';
  document.body.classList.toggle('menu-open', opening);
});

navLinks.forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !mobileMenu?.hidden) closeMenu();
});

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in-view');
    observer.unobserve(entry.target);
  });
}, { rootMargin: '0px 0px -8%', threshold: 0.08 });

document.querySelectorAll('.reveal').forEach((item) => revealObserver.observe(item));

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
    if (entry.target.id === 'photography') loadPhotography();
  });
}, { rootMargin: '-42% 0px -48%', threshold: 0 });

sections.forEach((section) => sectionObserver.observe(section));

let scrollTicking = false;
function updateScroll() {
  const scrollable = document.documentElement.scrollHeight - innerHeight;
  if (progress) progress.style.transform = `scaleX(${scrollable > 0 ? scrollY / scrollable : 0})`;
  scrollTicking = false;
}
window.addEventListener('scroll', () => {
  if (!scrollTicking) requestAnimationFrame(updateScroll);
  scrollTicking = true;
}, { passive: true });
updateScroll();

if (finePointer && !reducedMotion) {
  window.addEventListener('pointermove', (event) => {
    document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`);
    document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`);
  }, { passive: true });

  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      card.style.setProperty('--card-x', `${x * 100}%`);
      card.style.setProperty('--card-y', `${y * 100}%`);
      card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 2.4}deg) rotateY(${(x - 0.5) * 2.4}deg)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

const canvas = document.getElementById('system-map');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const pointer = { x: -1000, y: -1000 };
  let width = 0;
  let height = 0;
  let frame = 0;
  const nodes = Array.from({ length: 28 }, (_, index) => ({
    x: ((index * 37) % 101) / 100,
    y: ((index * 61 + 17) % 103) / 102,
    phase: index * 0.73
  }));

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function drawMap(time = 0) {
    ctx.clearRect(0, 0, width, height);
    const points = nodes.map((node) => {
      const drift = reducedMotion ? 0 : Math.sin(time * 0.00035 + node.phase) * 7;
      return { x: node.x * width + drift, y: node.y * height + Math.cos(time * 0.0003 + node.phase) * 5 };
    });

    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const distance = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
        if (distance > 115) continue;
        ctx.strokeStyle = `rgba(184,255,61,${0.16 * (1 - distance / 115)})`;
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[j].x, points[j].y);
        ctx.stroke();
      }
    }

    points.forEach((point) => {
      const near = Math.hypot(point.x - pointer.x, point.y - pointer.y) < 90;
      ctx.fillStyle = near ? '#b8ff3d' : 'rgba(242,240,233,.38)';
      ctx.beginPath();
      ctx.arc(point.x, point.y, near ? 2.7 : 1.6, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!reducedMotion) frame = requestAnimationFrame(drawMap);
  }

  canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
  });
  canvas.addEventListener('pointerleave', () => { pointer.x = -1000; pointer.y = -1000; });
  new ResizeObserver(() => { resizeCanvas(); if (reducedMotion) drawMap(); }).observe(canvas);
  resizeCanvas();
  drawMap();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(frame);
    else if (!reducedMotion) frame = requestAnimationFrame(drawMap);
  });
}

const lightbox = document.getElementById('photo-lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxIndex = document.getElementById('lightbox-index');
let photoItems = [];
let activePhoto = 0;
let photographyLoaded = false;

function showPhoto(index) {
  if (!photoItems.length) return;
  activePhoto = (index + photoItems.length) % photoItems.length;
  const photo = photoItems[activePhoto];
  lightboxImage.src = photo.src;
  lightboxImage.alt = photo.caption || `Photograph by Devgna Vyas, frame ${activePhoto + 1}`;
  lightboxCaption.textContent = photo.caption || 'Untitled photograph';
  lightboxIndex.textContent = `${String(activePhoto + 1).padStart(2, '0')} / ${String(photoItems.length).padStart(2, '0')}`;
}

function openPhoto(index) {
  if (!lightbox) return;
  showPhoto(index);
  lightbox.showModal();
}

document.getElementById('lightbox-close')?.addEventListener('click', () => lightbox?.close());
document.getElementById('lightbox-prev')?.addEventListener('click', () => showPhoto(activePhoto - 1));
document.getElementById('lightbox-next')?.addEventListener('click', () => showPhoto(activePhoto + 1));
lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });
window.addEventListener('keydown', (event) => {
  if (!lightbox?.open) return;
  if (event.key === 'ArrowRight') showPhoto(activePhoto + 1);
  if (event.key === 'ArrowLeft') showPhoto(activePhoto - 1);
});

function enableDrag(track) {
  let startX = 0;
  let startScroll = 0;
  let moved = false;
  let dragging = false;
  track.addEventListener('pointerdown', (event) => {
    startX = event.clientX;
    startScroll = track.scrollLeft;
    moved = false;
    dragging = true;
    track.classList.add('dragging');
  });
  track.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const delta = event.clientX - startX;
    moved ||= Math.abs(delta) > 6;
    track.scrollLeft = startScroll - delta;
  });
  window.addEventListener('pointerup', () => {
    dragging = false;
    track.classList.remove('dragging');
  });
  track.addEventListener('click', (event) => {
    if (moved) event.preventDefault();
    moved = false;
  }, true);
}

async function loadPhotography() {
  if (photographyLoaded) return;
  photographyLoaded = true;
  const track = document.getElementById('photo-track');
  const count = document.getElementById('photo-count');
  const caption = document.getElementById('photo-caption');
  if (!track) return;

  try {
    const response = await fetch('photography.json', { cache: 'force-cache' });
    if (!response.ok) throw new Error('Photo index unavailable');
    photoItems = (await response.json()).filter((item) => item?.type === 'image' && item?.src);
    if (!photoItems.length) throw new Error('No photographs found');
    count.textContent = String(photoItems.length).padStart(2, '0');
    caption.textContent = photoItems[0].caption || 'A small archive of places, light and things I noticed.';

    photoItems.forEach((photo, index) => {
      const button = document.createElement('button');
      const image = document.createElement('img');
      button.className = 'photo-frame';
      button.type = 'button';
      button.setAttribute('aria-label', photo.caption ? `Open photograph: ${photo.caption}` : `Open photograph ${index + 1}`);
      image.src = photo.src;
      image.alt = photo.caption || `Photograph by Devgna Vyas, frame ${index + 1}`;
      image.loading = index < 3 ? 'eager' : 'lazy';
      image.decoding = 'async';
      button.append(image);
      button.addEventListener('mouseenter', () => { caption.textContent = photo.caption || `Frame ${String(index + 1).padStart(2, '0')}`; });
      button.addEventListener('focus', () => { caption.textContent = photo.caption || `Frame ${String(index + 1).padStart(2, '0')}`; });
      button.addEventListener('click', () => openPhoto(index));
      track.append(button);
    });
    enableDrag(track);
  } catch {
    caption.textContent = 'The photography archive is unavailable right now.';
    count.textContent = '—';
  }
}

document.getElementById('year').textContent = String(new Date().getFullYear());

if (location.hash) {
  const scrollToHash = () => {
    const target = document.querySelector(location.hash);
    if (!target) return;
    const behavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    target.scrollIntoView();
    document.documentElement.style.scrollBehavior = behavior;
  };
  scrollToHash();
  window.addEventListener('load', scrollToHash, { once: true });
  setTimeout(scrollToHash, 500);
}
