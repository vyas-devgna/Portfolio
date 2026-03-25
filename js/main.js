/* ═══════════════════════════════════════════════════════════
   MAIN.JS — Navigation, Galleries, Lightbox, Scroll Reveals
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Navbar ──
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function updateNavbarState() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 200) current = s.id;
    });
    navLinks.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', updateNavbarState, { passive: true });
  updateNavbarState();

  // ── Mobile menu ──
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
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
  }

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
      if (t) {
        t.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start'
        });
      }
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
    if (!lightbox || !lbImg || !lbCaption || !Array.isArray(images) || images.length === 0) return;
    lbImages = images;
    lbIndex = index;
    showLightboxImage();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function showLightboxImage() {
    const activeItem = lbImages[lbIndex];
    if (!activeItem) return;
    lbImg.src = activeItem.src;
    lbImg.alt = activeItem.caption;
    lbCaption.textContent = activeItem.caption;
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (lightbox) {
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (!lbImages.length) return;
        lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
        showLightboxImage();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (!lbImages.length) return;
        lbIndex = (lbIndex + 1) % lbImages.length;
        showLightboxImage();
      });
    }

    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open') || !lbImages.length) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') {
        lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
        showLightboxImage();
      }
      if (e.key === 'ArrowRight') {
        lbIndex = (lbIndex + 1) % lbImages.length;
        showLightboxImage();
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // GALLERY CAROUSEL ENGINE
  // ═══════════════════════════════════════════════════════════

  function initCarousel(gallery) {
    const wrapper = gallery.closest('.gallery-wrapper');
    if (!wrapper) return null;

    const prevBtn = wrapper.querySelector('.gallery-nav-prev');
    const nextBtn = wrapper.querySelector('.gallery-nav-next');
    const progressBar = wrapper.querySelector('.gallery-progress-bar');
    const SCROLL_AMOUNT = 350;
    const AUTO_SPEED_PX_PER_SECOND = 36;
    const CLICK_SUPPRESS_MS = 260;

    let animationId = null;
    let resumeTimerId = null;
    let lastFrameTs = null;
    let isDragging = false;
    let startX = 0;
    let scrollStart = 0;
    let dragDistance = 0;
    let isPointerOver = false;
    let isInViewport = true;

    function getMaxScroll() {
      return Math.max(gallery.scrollWidth - gallery.clientWidth, 0);
    }

    function updateProgress() {
      if (!progressBar) return;
      const maxScroll = getMaxScroll();
      if (maxScroll <= 0) {
        progressBar.style.width = '100%';
        return;
      }
      const pct = Math.min((gallery.scrollLeft / maxScroll) * 100, 100);
      progressBar.style.width = pct + '%';
    }

    function clearResumeTimer() {
      if (!resumeTimerId) return;
      clearTimeout(resumeTimerId);
      resumeTimerId = null;
    }

    function canAutoScroll() {
      return gallery.dataset.autoscroll === 'true' &&
        gallery.children.length > 0 &&
        !prefersReducedMotion &&
        !isDragging &&
        !isPointerOver &&
        isInViewport &&
        !document.hidden &&
        getMaxScroll() > 0;
    }

    function stopAutoScroll() {
      clearResumeTimer();
      if (!animationId) return;
      cancelAnimationFrame(animationId);
      animationId = null;
      lastFrameTs = null;
    }

    function tick(ts) {
      if (!canAutoScroll()) {
        stopAutoScroll();
        return;
      }

      if (lastFrameTs === null) {
        lastFrameTs = ts;
      }
      const dt = ts - lastFrameTs;
      lastFrameTs = ts;

      const maxScroll = getMaxScroll();
      const delta = (AUTO_SPEED_PX_PER_SECOND * dt) / 1000;
      const next = gallery.scrollLeft + delta;
      gallery.scrollLeft = next >= maxScroll ? 0 : next;
      updateProgress();
      animationId = requestAnimationFrame(tick);
    }

    function startAutoScroll() {
      if (animationId || !canAutoScroll()) return;
      lastFrameTs = null;
      animationId = requestAnimationFrame(tick);
    }

    function scheduleAutoResume(delay = 400) {
      clearResumeTimer();
      if (!canAutoScroll()) return;
      resumeTimerId = setTimeout(() => {
        resumeTimerId = null;
        startAutoScroll();
      }, delay);
    }

    function scrollByAmount(amount) {
      stopAutoScroll();
      gallery.scrollBy({
        left: amount,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
      scheduleAutoResume(700);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => scrollByAmount(-SCROLL_AMOUNT));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => scrollByAmount(SCROLL_AMOUNT));
    }

    gallery.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', () => {
      updateProgress();
      scheduleAutoResume(180);
    }, { passive: true });

    wrapper.addEventListener('mouseenter', () => {
      isPointerOver = true;
      stopAutoScroll();
    });
    wrapper.addEventListener('mouseleave', () => {
      isPointerOver = false;
      scheduleAutoResume(130);
    });

    gallery.addEventListener('dragstart', (e) => e.preventDefault());
    gallery.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      isDragging = true;
      dragDistance = 0;
      startX = e.clientX;
      scrollStart = gallery.scrollLeft;
      gallery.classList.add('dragging');
      stopAutoScroll();
      if (gallery.setPointerCapture) {
        try { gallery.setPointerCapture(e.pointerId); } catch (_) {}
      }
    });

    gallery.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      dragDistance = Math.max(dragDistance, Math.abs(dx));
      gallery.scrollLeft = scrollStart - dx;
    });

    function endDrag(pointerEvent) {
      if (!isDragging) return;
      isDragging = false;
      gallery.classList.remove('dragging');
      if (pointerEvent && gallery.releasePointerCapture) {
        try { gallery.releasePointerCapture(pointerEvent.pointerId); } catch (_) {}
      }
      if (dragDistance > 6) {
        gallery.dataset.suppressClickUntil = String(Date.now() + CLICK_SUPPRESS_MS);
      }
      scheduleAutoResume(220);
    }

    gallery.addEventListener('pointerup', endDrag);
    gallery.addEventListener('pointercancel', endDrag);
    gallery.addEventListener('lostpointercapture', () => endDrag());

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAutoScroll();
      } else {
        scheduleAutoResume(120);
      }
    });

    const visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target !== gallery) return;
        isInViewport = entry.isIntersecting && entry.intersectionRatio > 0.2;
        if (isInViewport) {
          scheduleAutoResume(120);
        } else {
          stopAutoScroll();
        }
      });
    }, { threshold: [0, 0.2] });
    visibilityObserver.observe(gallery);

    updateProgress();
    startAutoScroll();

    return {
      startAutoScroll,
      stopAutoScroll,
      updateProgress,
      shouldSuppressClick() {
        return Date.now() < Number(gallery.dataset.suppressClickUntil || 0);
      }
    };
  }

  // ═══════════════════════════════════════════════════════════
  // GALLERY LOADER
  // ═══════════════════════════════════════════════════════════

  function loadGallery(jsonFile, containerId, emptyId) {
    const container = document.getElementById(containerId);
    const emptyEl = document.getElementById(emptyId);
    const wrapper = container ? container.closest('.gallery-wrapper') : null;
    if (!container || !emptyEl) return;

    function showEmptyState() {
      if (wrapper) wrapper.style.display = 'none';
      emptyEl.style.display = 'block';
    }

    fetch(jsonFile)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(items => {
        if (!Array.isArray(items) || !items.length) {
          showEmptyState();
          return;
        }

        if (wrapper) wrapper.style.display = '';
        emptyEl.style.display = 'none';

        const imageList = [];
        let carouselCtrl = null;

        items.forEach((item) => {
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

            div.tabIndex = 0;
            div.setAttribute('role', 'button');
            div.setAttribute('aria-label', item.caption ? 'Open image: ' + item.caption : 'Open image');

            const openFromTile = (e) => {
              if (e.detail === 0) return; // Ignore programmatic clicks
              if (carouselCtrl && carouselCtrl.shouldSuppressClick()) return;
              openLightbox(imageList, idx);
            };

            div.addEventListener('click', openFromTile);
            div.addEventListener('keydown', (e) => {
              if (e.key !== 'Enter' && e.key !== ' ') return;
              e.preventDefault();
              if (carouselCtrl && carouselCtrl.shouldSuppressClick()) return;
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

        // Init carousel after items are loaded
        carouselCtrl = initCarousel(container);
        if (carouselCtrl) carouselCtrl.updateProgress();
      })
      .catch(() => {
        showEmptyState();
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
