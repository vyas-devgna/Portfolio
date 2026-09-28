const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scenes = [...document.querySelectorAll('.scene')];
const navLinks = [...document.querySelectorAll('.nav-link')];
const currentLabel = document.getElementById('scene-current');
const menuButton = document.getElementById('menu-button');
const mobileMenu = document.getElementById('mobile-menu');
let photographyLoaded = false;
let photoItems = [];
let activePhoto = 0;

// Intersection Observer for Active Nav State
const navObserverOptions = {
  root: null,
  rootMargin: '-50% 0px -50% 0px',
  threshold: 0
};

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      const index = scenes.indexOf(entry.target);
      
      navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
      
      if (currentLabel) {
        currentLabel.textContent = String(index + 1).padStart(2, '0');
      }

      if (id === 'scene-elsewhere') {
        loadPhotography();
      }
    }
  });
}, navObserverOptions);

// Intersection Observer for Entrance Animations
const animObserverOptions = {
  root: null,
  rootMargin: '-15% 0px -15% 0px',
  threshold: 0
};

const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
    }
  });
}, animObserverOptions);

scenes.forEach(scene => {
  navObserver.observe(scene);
  animObserver.observe(scene);
});

// Mobile Menu
menuButton?.addEventListener('click', () => {
  if (!mobileMenu) return;
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  mobileMenu.hidden = open;
  menuButton.setAttribute('aria-expanded', String(!open));
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (mobileMenu && !mobileMenu.hidden) {
      mobileMenu.hidden = true;
      menuButton?.setAttribute('aria-expanded', 'false');
    }
  });
});

// Lightbox
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

window.addEventListener('keydown', (event) => {
  if (lightbox?.open) {
    if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(activePhoto + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(activePhoto - 1); }
  }
});

// Photography Carousel
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
