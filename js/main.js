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
  const appVersion = String(window.__APP_VERSION__ || 'dev');

  function withVersion(url) {
    if (typeof url !== 'string' || !url) return url;
    if (/^(?:data:|blob:|https?:|\/\/)/i.test(url)) return url;
    return url + (url.includes('?') ? '&' : '?') + 'v=' + encodeURIComponent(appVersion);
  }

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
    fetch(withVersion(file), { method: 'HEAD', cache: 'no-store' }).then(r => {
      if (r.ok) {
        document.querySelectorAll('[id^="resume-"]').forEach(btn => {
          btn.style.display = 'inline-flex';
          btn.href = withVersion(file);
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
  const carouselControllers = [];
  let lbImages = [];
  let lbIndex = 0;
  let isLightboxOpen = false;

  function pauseAllCarousels() {
    carouselControllers.forEach(ctrl => ctrl.stopAutoScroll());
  }

  function resumeAllCarousels() {
    carouselControllers.forEach(ctrl => ctrl.resumeNow());
  }

  function openLightbox(images, index) {
    if (!lightbox || !lbImg || !lbCaption || !Array.isArray(images) || images.length === 0) return;
    lbImages = images;
    lbIndex = index;
    isLightboxOpen = true;
    pauseAllCarousels();
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
    isLightboxOpen = false;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    resumeAllCarousels();
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
    const AUTO_SPEED_PX_PER_SECOND = 18;
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
    let pausedUntil = 0;
    let interactionPaused = false;
    let floatScroll = 0;

    // We cloned the items 3 times; exactly 1/3 of the scrollWidth is a single set.
    function getSingleSetWidth() {
      return gallery.scrollWidth / 3;
    }

    function updateProgress() {
      if (!progressBar) return;
      const sw = getSingleSetWidth();
      if (sw <= 0) {
        progressBar.style.width = '100%';
        return;
      }
      // calculate progress relative to a single set length
      const currentScroll = gallery.scrollLeft % sw;
      const pct = Math.min((currentScroll / sw) * 100, 100);
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
        !interactionPaused &&
        !isLightboxOpen &&
        isInViewport &&
        !document.hidden &&
        Date.now() >= pausedUntil &&
        getSingleSetWidth() > 0;
    }

    function pauseByUserInteraction() {
      interactionPaused = true;
      pausedUntil = 0;
      stopAutoScroll();
    }

    function pauseForInteraction(durationMs = 1400) {
      if (interactionPaused) return;
      const nextPauseUntil = Date.now() + durationMs;
      if (nextPauseUntil > pausedUntil) pausedUntil = nextPauseUntil;
      stopAutoScroll();
      scheduleAutoResume(durationMs + 20);
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

      if (lastFrameTs === null) lastFrameTs = ts;
      const dt = ts - lastFrameTs;
      lastFrameTs = ts;

      const delta = (AUTO_SPEED_PX_PER_SECOND * dt) / 1000;
      floatScroll += delta;
      
      const sw = getSingleSetWidth();
      if (sw > 0) {
        // Wrap exactly seamlessly
        if (floatScroll >= sw * 2) {
          floatScroll -= sw;
        } else if (floatScroll < sw) {
          floatScroll += sw;
        }
      }
      
      gallery.scrollLeft = floatScroll;
      // Sync if the browser throttled scrollLeft
      if (Math.abs(gallery.scrollLeft - floatScroll) > 2 && !isDragging) {
         floatScroll = gallery.scrollLeft;
      }

      updateProgress();
      animationId = requestAnimationFrame(tick);
    }

    function startAutoScroll() {
      if (animationId || !canAutoScroll()) return;
      lastFrameTs = null;
      floatScroll = gallery.scrollLeft;
      animationId = requestAnimationFrame(tick);
    }

    function scheduleAutoResume(delay = 400) {
      clearResumeTimer();
      resumeTimerId = setTimeout(() => {
        resumeTimerId = null;
        startAutoScroll();
      }, delay);
    }

    function boundsCheck() {
      const sw = getSingleSetWidth();
      if (sw <= 0) return;
      let pos = gallery.scrollLeft;
      let changed = false;
      while (pos >= sw * 2) { pos -= sw; changed = true; }
      while (pos <= 0) { pos += sw; changed = true; }
      if (changed) {
        gallery.scrollLeft = pos;
        floatScroll = pos;
      }
    }

    function scrollByAmount(amount) {
      pauseForInteraction(1100);
      gallery.scrollBy({
        left: amount,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => scrollByAmount(-SCROLL_AMOUNT));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => scrollByAmount(SCROLL_AMOUNT));
    }

    gallery.addEventListener('scroll', () => {
      boundsCheck();
      updateProgress();
      if (!isDragging && !animationId) {
        floatScroll = gallery.scrollLeft;
      }
    }, { passive: true });

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
    gallery.addEventListener('wheel', pauseByUserInteraction, { passive: true });
    gallery.addEventListener('touchstart', pauseByUserInteraction, { passive: true });
    gallery.addEventListener('touchmove', pauseByUserInteraction, { passive: true });
    gallery.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      isDragging = true;
      dragDistance = 0;
      startX = e.clientX;
      scrollStart = gallery.scrollLeft;
      gallery.classList.add('dragging');
      pauseByUserInteraction();
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
      resumeNow() {
        interactionPaused = false;
        pausedUntil = 0;
        isPointerOver = false;
        startAutoScroll();
      },
      shouldSuppressClick() {
        return Date.now() < Number(gallery.dataset.suppressClickUntil || 0);
      },
      setFloatScroll(val) {
        floatScroll = val;
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

    fetch(withVersion(jsonFile), { cache: 'no-store' })
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

        // Build list of all valid images for the lightbox
        items.forEach((item) => {
          if (item.type !== 'video') {
            imageList.push({ src: withVersion(item.src), caption: item.caption || '' });
          }
        });

        // Clone items 3 times for a seamless infinite loop block
        const MathSets = 3;
        for (let setIdx = 0; setIdx < MathSets; setIdx++) {
          let lightboxIdx = 0;

          items.forEach((item) => {
            const div = document.createElement('div');
            div.className = 'gallery-item';

            if (item.type === 'video') {
              const vid = document.createElement('video');
              vid.src = withVersion(item.src);
              vid.autoplay = true;
              vid.loop = true;
              vid.muted = true;
              vid.playsInline = true;
              vid.setAttribute('disablePictureInPicture', '');
              vid.setAttribute('controlsList', 'nodownload nofullscreen noremoteplayback');
              div.appendChild(vid);
            } else {
              const img = document.createElement('img');
              img.src = withVersion(item.src);
              img.alt = item.caption || '';
              img.loading = 'lazy';
              div.appendChild(img);

              const currentIdx = lightboxIdx;
              lightboxIdx++;

              div.tabIndex = 0;
              div.setAttribute('role', 'button');
              div.setAttribute('aria-label', item.caption ? 'Open image: ' + item.caption : 'Open image');

              const openFromTile = (e) => {
                if (e.detail === 0) return; // programmatic click
                if (carouselCtrl && carouselCtrl.shouldSuppressClick()) return;
                openLightbox(imageList, currentIdx);
              };

              div.addEventListener('click', openFromTile);
              div.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                e.preventDefault();
                if (carouselCtrl && carouselCtrl.shouldSuppressClick()) return;
                openLightbox(imageList, currentIdx);
              });
            }

            if (item.caption) {
              const cap = document.createElement('div');
              cap.className = 'gallery-caption';
              cap.textContent = item.caption;
              div.appendChild(cap);
            }
            
            div.addEventListener('dragstart', (e) => e.preventDefault());

            container.appendChild(div);
          });
        }

        // Init carousel after items are loaded
        carouselCtrl = initCarousel(container);
        if (carouselCtrl) {
          carouselControllers.push(carouselCtrl);
          carouselCtrl.updateProgress();

          // Move scroll secretly to the middle set (which is exactly sw) to allow backward drag/scroll
          requestAnimationFrame(() => {
            const sw = container.scrollWidth / 3;
            if (sw > 0) {
              container.scrollLeft = sw;
              carouselCtrl.setFloatScroll(sw);
              carouselCtrl.updateProgress();
            }
          });
        }
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

  fetch(withVersion('writing.json'), { cache: 'no-store' })
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
