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
let photoItems = [];
let activePhoto = 0;

function updateSceneUI(index) {
  sceneLinks.forEach((button) => button.classList.toggle('active', Number(button.dataset.sceneLink) === index));
  desktopNav.forEach((button) => button.classList.toggle('active', Number(button.dataset.sceneLink) === index));
  railButtons.forEach((button) => button.classList.toggle('active', Number(button.dataset.sceneLink) === index));
  if (currentLabel) currentLabel.textContent = String(index + 1).padStart(2, '0');
}

function applyScene(index) {
  const oldScene = scenes[sceneIndex];
  const newScene = scenes[index];
  if (!newScene || index === sceneIndex) return;
  oldScene?.classList.add('exiting');
  oldScene?.classList.remove('active');
  newScene.classList.add('active');
  newScene.classList.remove('exiting');
  sceneIndex = index;
  updateSceneUI(index);
  if (index === 4) loadPhotography();
  window.setTimeout(() => oldScene?.classList.remove('exiting'), 650);
}

function closeMenu() {
  if (!mobileMenu || !menuButton) return;
  mobileMenu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
}

function goToScene(index) {
  const next = Math.max(0, Math.min(scenes.length - 1, index));
  if (next === sceneIndex || sceneLocked) return;
  sceneLocked = true;
  const mutate = () => applyScene(next);
  if (!reducedMotion && document.startViewTransition) document.startViewTransition(mutate);
  else mutate();
  window.setTimeout(() => { sceneLocked = false; }, reducedMotion ? 20 : 560);
  closeMenu();
}

sceneLinks.forEach((button) => button.addEventListener('click', () => goToScene(Number(button.dataset.sceneLink))));
window.addEventListener('wheel', (event) => {
  if (document.getElementById('photo-lightbox')?.open) return;
  if (Math.abs(event.deltaY) < 26 || sceneLocked) return;
  goToScene(sceneIndex + (event.deltaY > 0 ? 1 : -1));
}, { passive: true });
window.addEventListener('touchstart', (event) => { touchStartY = event.changedTouches[0]?.clientY ?? 0; }, { passive: true });
window.addEventListener('touchend', (event) => {
  if (document.getElementById('photo-lightbox')?.open) return;
  const end = event.changedTouches[0]?.clientY ?? touchStartY;
  const delta = touchStartY - end;
  if (Math.abs(delta) > 54) goToScene(sceneIndex + (delta > 0 ? 1 : -1));
}, { passive: true });
window.addEventListener('keydown', (event) => {
  const lightbox = document.getElementById('photo-lightbox');
  if (lightbox?.open) {
    if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(activePhoto + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(activePhoto - 1); }
    return;
  }
  if (event.key === 'ArrowDown' || event.key === 'PageDown') { event.preventDefault(); goToScene(sceneIndex + 1); }
  if (event.key === 'ArrowUp' || event.key === 'PageUp') { event.preventDefault(); goToScene(sceneIndex - 1); }
  if (event.key === 'Home') { event.preventDefault(); goToScene(0); }
  if (event.key === 'End') { event.preventDefault(); goToScene(scenes.length - 1); }
});

menuButton?.addEventListener('click', () => {
  if (!mobileMenu) return;
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  mobileMenu.hidden = open;
  menuButton.setAttribute('aria-expanded', String(!open));
});

const lightbox = document.getElementById('photo-lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxIndex = document.getElementById('lightbox-index');

function showPhoto(index) {
  if (!photoItems.length || !lightbox) return;
  activePhoto = (index + photoItems.length) % photoItems.length;
  const photo = photoItems[activePhoto];
  if (lightboxImage) {
    lightboxImage.src = photo.src;
    lightboxImage.alt = photo.caption || `Photograph by Devgna Vyas, frame ${activePhoto + 1}`;
  }
  if (lightboxCaption) lightboxCaption.textContent = photo.caption || 'Untitled photograph';
  if (lightboxIndex) lightboxIndex.textContent = `${String(activePhoto + 1).padStart(2, '0')} / ${String(photoItems.length).padStart(2, '0')}`;
}

function openPhoto(index) {
  if (!lightbox) return;
  showPhoto(index);
  if (!lightbox.open) lightbox.showModal();
}

document.getElementById('lightbox-close')?.addEventListener('click', () => lightbox?.close());
document.getElementById('lightbox-prev')?.addEventListener('click', () => showPhoto(activePhoto - 1));
document.getElementById('lightbox-next')?.addEventListener('click', () => showPhoto(activePhoto + 1));
lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });

async function loadPhotography() {
  if (photographyLoaded) return;
  photographyLoaded = true;
  const track = document.getElementById('photo-track');
  const count = document.getElementById('photo-count');
  const caption = document.getElementById('photo-caption');
  if (!track) return;

  try {
    const response = await fetch('photography.json', { cache: 'force-cache' });
    if (!response.ok) throw new Error('photo index unavailable');
    photoItems = (await response.json()).filter((item) => item?.type === 'image' && item?.src);
    if (!photoItems.length) throw new Error('no photos');
    if (count) count.textContent = String(photoItems.length).padStart(2, '0');
    if (caption) caption.textContent = photoItems[0].caption || 'A small archive of places, light and things I noticed.';

    const renderSet = [...photoItems, ...photoItems];
    renderSet.forEach((photo, duplicateIndex) => {
      const sourceIndex = duplicateIndex % photoItems.length;
      const button = document.createElement('button');
      button.className = 'photo-frame';
      button.type = 'button';
      button.dataset.photoIndex = String(sourceIndex);
      button.setAttribute('aria-label', photo.caption ? `Open photograph: ${photo.caption}` : `Open photograph ${sourceIndex + 1}`);
      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.caption || `Photograph by Devgna Vyas, frame ${sourceIndex + 1}`;
      img.loading = sourceIndex < 6 ? 'eager' : 'lazy';
      img.decoding = 'async';
      button.append(img);
      button.addEventListener('mouseenter', () => { if (caption) caption.textContent = photo.caption || `Frame ${String(sourceIndex + 1).padStart(2, '0')}`; });
      button.addEventListener('focus', () => { if (caption) caption.textContent = photo.caption || `Frame ${String(sourceIndex + 1).padStart(2, '0')}`; });
      button.addEventListener('click', () => openPhoto(sourceIndex));
      track.append(button);
    });
  } catch {
    if (caption) caption.textContent = 'Photography archive is unavailable right now.';
    if (count) count.textContent = '—';
  }
}

const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());
updateSceneUI(0);
