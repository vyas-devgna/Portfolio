/* ═══════════════════════════════════════════════════════════
   MAIN.JS — Navigation, Galleries, Lightbox, Scroll Reveals
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Navbar ──
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 200) current = s.id;
    });
    navLinks.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  });

  // ── Mobile menu ──
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
  });
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('open');
    });
  });

  // ── Scroll reveal ──
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ── Resume detection ──
  ['resume.pdf', 'cv.pdf', 'Resume.pdf', 'CV.pdf'].forEach(file => {
    fetch(file, { method: 'HEAD' }).then(r => {
      if (r.ok) {
        document.querySelectorAll('[id^="resume-"]').forEach(btn => {
          btn.style.display = 'inline-flex';
          btn.href = file;
        });
      }
    }).catch(() => {});
  });

  // ── Smooth scroll ──
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      const t = document.querySelector(this.getAttribute('href'));
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ═══════════════════════════════════════════════════════════
  // LIGHTBOX — Universal for all galleries
  // ═══════════════════════════════════════════════════════════

  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbCaption = document.getElementById('lightbox-caption');
  let lbImages = [];
  let lbIndex = 0;

  function openLightbox(images, index) {
    lbImages = images;
    lbIndex = index;
    showLightboxImage();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function showLightboxImage() {
    lbImg.src = lbImages[lbIndex].src;
    lbImg.alt = lbImages[lbIndex].caption;
    lbCaption.textContent = lbImages[lbIndex].caption;
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  document.getElementById('lightbox-prev').addEventListener('click', () => {
    lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
    showLightboxImage();
  });
  document.getElementById('lightbox-next').addEventListener('click', () => {
    lbIndex = (lbIndex + 1) % lbImages.length;
    showLightboxImage();
  });
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') { lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length; showLightboxImage(); }
    if (e.key === 'ArrowRight') { lbIndex = (lbIndex + 1) % lbImages.length; showLightboxImage(); }
  });

  // ═══════════════════════════════════════════════════════════
  // GALLERY CAROUSEL ENGINE
  // ═══════════════════════════════════════════════════════════

  function initCarousel(gallery) {
    const wrapper = gallery.closest('.gallery-wrapper');
    if (!wrapper) return;

    const prevBtn = wrapper.querySelector('.gallery-nav-prev');
    const nextBtn = wrapper.querySelector('.gallery-nav-next');
    const progressBar = wrapper.querySelector('.gallery-progress-bar');
    const SCROLL_AMOUNT = 350;
    let autoScrollId = null;
    let isDragging = false;
    let startX = 0;
    let scrollStart = 0;
    let dragMoved = false;

    // Nav arrows
    prevBtn.addEventListener('click', () => {
      gallery.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', () => {
      gallery.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' });
    });

    // Progress bar
    function updateProgress() {
      const maxScroll = gallery.scrollWidth - gallery.clientWidth;
      if (maxScroll <= 0) {
        progressBar.style.width = '100%';
        return;
      }
      const pct = (gallery.scrollLeft / maxScroll) * 100;
      progressBar.style.width = pct + '%';
    }
    gallery.addEventListener('scroll', updateProgress);
    updateProgress();

    // Auto-scroll
    function startAutoScroll() {
      if (autoScrollId) return;
      autoScrollId = setInterval(() => {
        if (isDragging) return;
        const maxScroll = gallery.scrollWidth - gallery.clientWidth;
        if (maxScroll <= 0) return;
        if (gallery.scrollLeft >= maxScroll - 2) {
          gallery.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          gallery.scrollBy({ left: 1, behavior: 'auto' });
        }
      }, 30);
    }

    function stopAutoScroll() {
      if (autoScrollId) { clearInterval(autoScrollId); autoScrollId = null; }
    }

    // Pause on hover
    wrapper.addEventListener('mouseenter', stopAutoScroll);
    wrapper.addEventListener('mouseleave', () => {
      if (gallery.dataset.autoscroll === 'true' && gallery.children.length > 0) startAutoScroll();
    });

    // Drag to scroll
    gallery.addEventListener('mousedown', (e) => {
      isDragging = true;
      dragMoved = false;
      startX = e.pageX;
      scrollStart = gallery.scrollLeft;
      gallery.classList.add('dragging');
      stopAutoScroll();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.pageX - startX;
      if (Math.abs(dx) > 3) dragMoved = true;
      gallery.scrollLeft = scrollStart - dx;
    });

    window.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      gallery.classList.remove('dragging');
    });

    // Start auto-scroll if gallery has items
    if (gallery.dataset.autoscroll === 'true' && gallery.children.length > 0) {
      startAutoScroll();
    }

    return { startAutoScroll, stopAutoScroll, updateProgress };
  }

  // ═══════════════════════════════════════════════════════════
  // GALLERY LOADER
  // ═══════════════════════════════════════════════════════════

  function loadGallery(jsonFile, containerId, emptyId) {
    const container = document.getElementById(containerId);
    const emptyEl = document.getElementById(emptyId);

    fetch(jsonFile)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(items => {
        if (!items.length) { emptyEl.style.display = 'block'; return; }

        const imageList = [];

        items.forEach((item, i) => {
          const div = document.createElement('div');
          div.className = 'gallery-item';

          if (item.type === 'video') {
            const vid = document.createElement('video');
            vid.src = item.src;
            vid.autoplay = true;
            vid.loop = true;
            vid.muted = true;
            vid.playsInline = true;
            vid.setAttribute('disablePictureInPicture', '');
            vid.setAttribute('controlsList', 'nodownload nofullscreen noremoteplayback');
            div.appendChild(vid);
          } else {
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.caption || '';
            img.loading = 'lazy';
            div.appendChild(img);

            const idx = imageList.length;
            imageList.push({ src: item.src, caption: item.caption || '' });

            div.addEventListener('click', (e) => {
              if (e.detail === 0) return; // Ignore programmatic clicks
              openLightbox(imageList, idx);
            });
          }

          if (item.caption) {
            const cap = document.createElement('div');
            cap.className = 'gallery-caption';
            cap.textContent = item.caption;
            div.appendChild(cap);
          }

          container.appendChild(div);
        });

        // Prevent lightbox on drag
        container.addEventListener('click', (e) => {
          if (container.classList.contains('dragging')) e.stopPropagation();
        }, true);

        // Init carousel after items are loaded
        const ctrl = initCarousel(container);
        if (ctrl) ctrl.updateProgress();
      })
      .catch(() => {
        emptyEl.style.display = 'block';
      });
  }

  loadGallery('photography.json', 'photo-gallery', 'photo-empty');
  loadGallery('animals.json', 'animals-gallery', 'animals-empty');
  loadGallery('sketches.json', 'sketches-gallery', 'sketches-empty');

  // ═══════════════════════════════════════════════════════════
  // POETRY / WRITING
  // ═══════════════════════════════════════════════════════════

  fetch('writing.json')
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(poems => {
      if (!poems.length) { document.getElementById('poetry-empty').style.display = 'block'; return; }
      const container = document.getElementById('poetry-container');
      const fontMap = {
        'cormorant':   '"Cormorant Garamond", serif',
        'playfair':    '"Playfair Display", serif',
        'lora':        '"Lora", serif',
        'eb-garamond': '"EB Garamond", serif',
        'spectral':    '"Spectral", serif',
        'tiro-hindi':  '"Tiro Devanagari Hindi", serif',
        'yatra':       '"Yatra One", cursive',
        'noto-hindi':  '"Noto Serif Devanagari", serif',
        'mukta':       '"Mukta", sans-serif',
        'baloo':       '"Baloo 2", cursive',
      };

      poems.forEach(poem => {
        const card = document.createElement('div');
        card.className = 'poem-card reveal';
        const ff = fontMap[poem.font] || '"Lora", serif';
        card.innerHTML = `
          <h3 class="poem-title" style="font-family:${ff}">${poem.title}</h3>
          <div class="poem-body" style="font-family:${ff}">${poem.body}</div>
          ${poem.meta ? `<p class="poem-meta">${poem.meta}</p>` : ''}
        `;
        container.appendChild(card);
      });
      document.querySelectorAll('.poem-card.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
    })
    .catch(() => {
      document.getElementById('poetry-empty').style.display = 'block';
    });

})();
