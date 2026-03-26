/* ═══════════════════════════════════════════════════════════
   MAIN.JS — All features: Nav, Galleries, Lightbox, Writing,
   Theme Toggle, Typed Text, Custom Cursor, Scroll Progress,
   Back-to-Top, GitHub Widget, Skill Bars, Section Dividers
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const appVersion = String(window.__APP_VERSION__ || 'dev');

  function withVersion(url) {
    if (typeof url !== 'string' || !url) return url;
    if (/^(?:data:|blob:|https?:\/\/)/i.test(url)) return url;
    return url + (url.includes('?') ? '&' : '?') + 'v=' + encodeURIComponent(appVersion);
  }

  // ═══════════════════════════════════════════════════════════
  // 1. BACK-TO-TOP BUTTON
  // ═══════════════════════════════════════════════════════════

  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 2. SCROLL PROGRESS BAR
  // ═══════════════════════════════════════════════════════════

  const scrollProgressFill = document.querySelector('.scroll-progress-fill');

  // ═══════════════════════════════════════════════════════════
  // NAVBAR + Scroll handler (unified)
  // ═══════════════════════════════════════════════════════════

  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  let scrollTicking = false;
  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      updateNavbarState();
      updateScrollProgress();
      updateBackToTop();
      scrollTicking = false;
    });
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

  function updateScrollProgress() {
    if (!scrollProgressFill) return;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    scrollProgressFill.style.width = Math.min(pct, 100) + '%';
  }

  function updateBackToTop() {
    if (!backToTop) return;
    backToTop.classList.toggle('visible', window.scrollY > window.innerHeight * 0.6);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  updateNavbarState();
  updateScrollProgress();
  updateBackToTop();

  // ═══════════════════════════════════════════════════════════
  // 3. CUSTOM CURSOR (desktop only)
  // ═══════════════════════════════════════════════════════════

  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');

  if (cursorDot && cursorRing && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let cursorVisible = false;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
      if (!cursorVisible) {
        cursorVisible = true;
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '0.6';
      }
    });

    // Smooth follow for ring
    function animateCursor() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    document.addEventListener('mouseenter', () => {
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '0.6';
    });
    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
    });

    // Hover effects on interactive elements
    const hoverTargets = 'a, button, [role="button"], input, select, textarea, .gallery-item, .project-card, .skill-category, .contact-item, .publication-card, .poem-card';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverTargets)) {
        cursorDot.classList.add('hovering');
        cursorRing.classList.add('hovering');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverTargets)) {
        cursorDot.classList.remove('hovering');
        cursorRing.classList.remove('hovering');
      }
    });
  } else {
    // Hide cursor elements on touch devices
    if (cursorDot) cursorDot.style.display = 'none';
    if (cursorRing) cursorRing.style.display = 'none';
  }

  // ═══════════════════════════════════════════════════════════
  // 4. TYPED TEXT ANIMATION
  // ═══════════════════════════════════════════════════════════

  const typedEl = document.getElementById('hero-typed');
  if (typedEl && !prefersReducedMotion) {
    const fullText = typedEl.textContent;
    typedEl.textContent = '';
    typedEl.style.opacity = '1';
    typedEl.style.transform = 'none';

    let charIndex = 0;
    const cursor = document.createElement('span');
    cursor.className = 'typed-cursor';
    typedEl.appendChild(cursor);

    function typeNextChar() {
      if (charIndex < fullText.length) {
        cursor.insertAdjacentText('beforebegin', fullText.charAt(charIndex));
        charIndex++;
        setTimeout(typeNextChar, 18 + Math.random() * 22);
      } else {
        // Remove cursor after a pause
        setTimeout(() => {
          cursor.style.opacity = '0';
          setTimeout(() => cursor.remove(), 500);
        }, 2000);
      }
    }

    // Start typing after a short delay
    setTimeout(typeNextChar, 800);
  }

  // ═══════════════════════════════════════════════════════════
  // 5. DARK/LIGHT THEME TOGGLE
  // ═══════════════════════════════════════════════════════════

  const themeToggle = document.getElementById('theme-toggle');
  const metaThemeColor = document.getElementById('meta-theme-color');

  function getStoredTheme() {
    try { return localStorage.getItem('portfolio_theme'); } catch (_) { return null; }
  }
  function setStoredTheme(theme) {
    try { localStorage.setItem('portfolio_theme', theme); } catch (_) {}
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (metaThemeColor) {
      metaThemeColor.content = theme === 'light' ? '#f8f8fa' : '#0a0a0a';
    }
  }

  // Load saved theme or defaultnot dark
  const savedTheme = getStoredTheme();
  if (savedTheme) applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      setStoredTheme(next);
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 8. GITHUB ACTIVITY WIDGET
  // ═══════════════════════════════════════════════════════════

  const ghStatsEl = document.getElementById('github-stats');
  if (ghStatsEl) {
    fetch('https://api.github.com/users/vyas-devgna', { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        ghStatsEl.style.display = 'flex';
        ghStatsEl.innerHTML = `
          <div class="gh-stat">
            <span class="gh-stat-value">${data.public_repos || 0}</span>
            <span class="gh-stat-label">Repos</span>
          </div>
          <div class="gh-stat">
            <span class="gh-stat-value">${data.followers || 0}</span>
            <span class="gh-stat-label">Followers</span>
          </div>
          <div class="gh-stat">
            <span class="gh-stat-value">${data.following || 0}</span>
            <span class="gh-stat-label">Following</span>
          </div>
        `;
      })
      .catch(() => {
        // Silently fail — don't show widget
      });
  }

  // ═══════════════════════════════════════════════════════════
  // 9. ANIMATED SECTION DIVIDERS
  // ═══════════════════════════════════════════════════════════

  const dividerObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          dividerObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5, rootMargin: '0px 0px -20px 0px' }
  );
  document.querySelectorAll('.section-divider').forEach(el => dividerObserver.observe(el));

  // ═══════════════════════════════════════════════════════════
  // 10. SKILL PROFICIENCY BARS
  // ═══════════════════════════════════════════════════════════

  const skillBarObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Animate all skill bars inside this element
          entry.target.querySelectorAll('.skill-bar').forEach((bar, i) => {
            const width = bar.getAttribute('data-width') || '80';
            bar.style.setProperty('--bar-width', width + '%');
            setTimeout(() => bar.classList.add('animate'), i * 80);
          });
          skillBarObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  document.querySelectorAll('.skills-grid').forEach(el => skillBarObserver.observe(el));

  // ═══════════════════════════════════════════════════════════
  // Mobile menu
  // ═══════════════════════════════════════════════════════════

  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    function setMenuState(isOpen) {
      hamburger.classList.toggle('active', isOpen);
      mobileMenu.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    hamburger.addEventListener('click', () => {
      setMenuState(!mobileMenu.classList.contains('open'));
    });

    document.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => setMenuState(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setMenuState(false);
    });
  }

  // ═══════════════════════════════════════════════════════════
  // Scroll reveal
  // ═══════════════════════════════════════════════════════════

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

  // Resume detection
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

  // Smooth scroll
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
  // IMAGE COMPRESSION
  // ═══════════════════════════════════════════════════════════

  function createThumbnail(originalSrc, maxWidth, maxHeight, quality) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        if (w > maxWidth || h > maxHeight) {
          const ratio = Math.min(maxWidth / w, maxHeight / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        try {
          resolve(canvas.toDataURL('image/jpeg', quality || 0.6));
        } catch (e) {
          resolve(originalSrc);
        }
      };
      img.onerror = () => resolve(originalSrc);
      img.src = originalSrc;
    });
  }

  // ═══════════════════════════════════════════════════════════
  // LIGHTBOX
  // ═══════════════════════════════════════════════════════════

  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbCaption = document.getElementById('lightbox-caption');
  const mainContent = document.getElementById('main-content');
  const carouselControllers = [];
  let lbImages = [];
  let lbIndex = 0;
  let isLightboxOpen = false;

  const lbClose = document.getElementById('lightbox-close');
  const lbPrev = document.getElementById('lightbox-prev');
  const lbNext = document.getElementById('lightbox-next');
  const focusableInLightbox = [lbClose, lbPrev, lbNext].filter(Boolean);

  function pauseAllCarousels() { carouselControllers.forEach(ctrl => ctrl.stopAutoScroll()); }
  function resumeAllCarousels() { carouselControllers.forEach(ctrl => ctrl.resumeNow()); }

  function openLightbox(images, index) {
    if (!lightbox || !lbImg || !Array.isArray(images) || !images.length) return;
    lbImages = images;
    lbIndex = index;
    isLightboxOpen = true;
    pauseAllCarousels();
    showLightboxImage();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (mainContent) mainContent.setAttribute('aria-hidden', 'true');
    requestAnimationFrame(() => { if (lbClose) lbClose.focus(); });
  }

  function showLightboxImage() {
    const item = lbImages[lbIndex];
    if (!item) return;
    lbImg.src = item.fullSrc || item.src;
    lbImg.alt = item.caption || 'Gallery image';
    if (lbCaption) lbCaption.textContent = item.caption || '';
    if (lbImages.length > 1) {
      new Image().src = (lbImages[(lbIndex - 1 + lbImages.length) % lbImages.length].fullSrc || '');
      new Image().src = (lbImages[(lbIndex + 1) % lbImages.length].fullSrc || '');
    }
  }

  function closeLightbox() {
    if (!lightbox) return;
    isLightboxOpen = false;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    if (mainContent) mainContent.removeAttribute('aria-hidden');
    resumeAllCarousels();
  }

  if (lightbox) {
    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    if (lbPrev) lbPrev.addEventListener('click', () => { if (lbImages.length) { lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length; showLightboxImage(); } });
    if (lbNext) lbNext.addEventListener('click', () => { if (lbImages.length) { lbIndex = (lbIndex + 1) % lbImages.length; showLightboxImage(); } });
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open') || !lbImages.length) return;
      if (e.key === 'Escape') { closeLightbox(); return; }
      if (e.key === 'ArrowLeft') { lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length; showLightboxImage(); return; }
      if (e.key === 'ArrowRight') { lbIndex = (lbIndex + 1) % lbImages.length; showLightboxImage(); return; }
      if (e.key === 'Tab' && focusableInLightbox.length > 0) {
        const first = focusableInLightbox[0], last = focusableInLightbox[focusableInLightbox.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // CAROUSEL ENGINE
  // ═══════════════════════════════════════════════════════════

  function initCarousel(gallery, options) {
    const opts = Object.assign({ autoScroll: true, cloned: true }, options || {});
    const wrapper = gallery.closest('.gallery-wrapper') || gallery.closest('.writing-gallery-wrapper');
    if (!wrapper) return null;

    const prevBtn = wrapper.querySelector('.gallery-nav-prev');
    const nextBtn = wrapper.querySelector('.gallery-nav-next');
    const progressBar = wrapper.querySelector('.gallery-progress-bar');
    const SCROLL_AMOUNT = 350;
    const AUTO_SPEED = 18;
    const CLICK_SUPPRESS_MS = 260;

    let animationId = null, resumeTimerId = null, lastFrameTs = null;
    let isDragging = false, startX = 0, scrollStart = 0, dragDistance = 0;
    let isPointerOver = false, isInViewport = true, pausedUntil = 0, floatScroll = 0;
    const setCount = opts.cloned ? 3 : 1;

    function getSingleSetWidth() { return gallery.scrollWidth / setCount; }

    function updateProgress() {
      if (!progressBar) return;
      const totalScroll = gallery.scrollWidth - gallery.clientWidth;
      if (totalScroll <= 0) { progressBar.style.width = '100%'; return; }
      if (opts.cloned) {
        const sw = getSingleSetWidth();
        if (sw <= 0) { progressBar.style.width = '100%'; return; }
        progressBar.style.width = Math.min(((gallery.scrollLeft % sw) / sw) * 100, 100) + '%';
      } else {
        progressBar.style.width = Math.min((gallery.scrollLeft / totalScroll) * 100, 100) + '%';
      }
    }

    function clearResumeTimer() { if (resumeTimerId) { clearTimeout(resumeTimerId); resumeTimerId = null; } }

    function canAutoScroll() {
      return opts.autoScroll && gallery.dataset.autoscroll === 'true' && gallery.children.length > 0 &&
        !prefersReducedMotion && !isDragging && !isPointerOver && !isLightboxOpen &&
        isInViewport && !document.hidden && Date.now() >= pausedUntil && gallery.scrollWidth > gallery.clientWidth;
    }

    function pauseForInteraction(ms) {
      ms = ms || 1400;
      const next = Date.now() + ms;
      if (next > pausedUntil) pausedUntil = next;
      stopAutoScroll();
      scheduleAutoResume(ms + 20);
    }

    function stopAutoScroll() {
      clearResumeTimer();
      if (!animationId) return;
      cancelAnimationFrame(animationId);
      animationId = null;
      lastFrameTs = null;
    }

    function tick(ts) {
      if (!canAutoScroll()) { stopAutoScroll(); return; }
      if (lastFrameTs === null) lastFrameTs = ts;
      const dt = ts - lastFrameTs;
      lastFrameTs = ts;
      floatScroll += (AUTO_SPEED * dt) / 1000;

      if (opts.cloned) {
        const sw = getSingleSetWidth();
        if (sw > 0) {
          if (floatScroll >= sw * 2) floatScroll -= sw;
          else if (floatScroll < sw) floatScroll += sw;
        }
      } else {
        if (floatScroll >= gallery.scrollWidth - gallery.clientWidth) { floatScroll = 0; gallery.scrollLeft = 0; }
      }

      gallery.scrollLeft = floatScroll;
      if (Math.abs(gallery.scrollLeft - floatScroll) > 2 && !isDragging) floatScroll = gallery.scrollLeft;
      updateProgress();
      animationId = requestAnimationFrame(tick);
    }

    function startAutoScroll() {
      if (animationId || !canAutoScroll()) return;
      lastFrameTs = null;
      floatScroll = gallery.scrollLeft;
      animationId = requestAnimationFrame(tick);
    }

    function scheduleAutoResume(delay) {
      clearResumeTimer();
      resumeTimerId = setTimeout(() => { resumeTimerId = null; startAutoScroll(); }, delay || 400);
    }

    function boundsCheck() {
      if (!opts.cloned) return;
      const sw = getSingleSetWidth();
      if (sw <= 0) return;
      let pos = gallery.scrollLeft, changed = false;
      while (pos >= sw * 2) { pos -= sw; changed = true; }
      while (pos <= 0) { pos += sw; changed = true; }
      if (changed) { gallery.scrollLeft = pos; floatScroll = pos; }
    }

    function scrollByAmount(amount) {
      pauseForInteraction(1100);
      gallery.scrollBy({ left: amount, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }

    if (prevBtn) prevBtn.addEventListener('click', () => scrollByAmount(-SCROLL_AMOUNT));
    if (nextBtn) nextBtn.addEventListener('click', () => scrollByAmount(SCROLL_AMOUNT));

    gallery.addEventListener('scroll', () => { boundsCheck(); updateProgress(); if (!isDragging && !animationId) floatScroll = gallery.scrollLeft; }, { passive: true });
    window.addEventListener('resize', () => { updateProgress(); scheduleAutoResume(180); }, { passive: true });
    wrapper.addEventListener('mouseenter', () => { isPointerOver = true; stopAutoScroll(); });
    wrapper.addEventListener('mouseleave', () => { isPointerOver = false; scheduleAutoResume(130); });

    gallery.addEventListener('dragstart', (e) => e.preventDefault());
    gallery.addEventListener('wheel', () => pauseForInteraction(1300), { passive: true });
    gallery.addEventListener('touchstart', () => pauseForInteraction(1300), { passive: true });
    gallery.addEventListener('touchmove', () => pauseForInteraction(1300), { passive: true });
    gallery.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      isDragging = true; dragDistance = 0; startX = e.clientX; scrollStart = gallery.scrollLeft;
      gallery.classList.add('dragging');
      pauseForInteraction(1500);
    });
    gallery.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      dragDistance = Math.max(dragDistance, Math.abs(dx));
      gallery.scrollLeft = scrollStart - dx;
    });

    function endDrag(evt) {
      if (!isDragging) return;
      isDragging = false;
      gallery.classList.remove('dragging');
      if (evt && gallery.releasePointerCapture) try { gallery.releasePointerCapture(evt.pointerId); } catch (_) {}
      if (dragDistance > 6) gallery.dataset.suppressClickUntil = String(Date.now() + CLICK_SUPPRESS_MS);
    }

    gallery.addEventListener('pointerup', endDrag);
    gallery.addEventListener('pointercancel', endDrag);
    gallery.addEventListener('lostpointercapture', () => endDrag());
    document.addEventListener('visibilitychange', () => { document.hidden ? stopAutoScroll() : scheduleAutoResume(120); });

    const visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target !== gallery) return;
        isInViewport = entry.isIntersecting && entry.intersectionRatio > 0.2;
        isInViewport ? scheduleAutoResume(120) : stopAutoScroll();
      });
    }, { threshold: [0, 0.2] });
    visibilityObserver.observe(gallery);

    updateProgress();
    if (opts.autoScroll) startAutoScroll();

    return {
      startAutoScroll,
      stopAutoScroll,
      updateProgress,
      resumeNow() { pausedUntil = 0; isPointerOver = false; startAutoScroll(); },
      shouldSuppressClick() { return Date.now() < Number(gallery.dataset.suppressClickUntil || 0); },
      setFloatScroll(val) { floatScroll = val; }
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

    function showEmptyState() { if (wrapper) wrapper.style.display = 'none'; emptyEl.style.display = 'block'; }

    fetch(withVersion(jsonFile), { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(items => {
        if (!Array.isArray(items) || !items.length) { showEmptyState(); return; }

        container.classList.remove('is-loading');
        if (wrapper) wrapper.style.display = '';
        emptyEl.style.display = 'none';

        const imageList = [];
        let carouselCtrl = null;

        items.forEach(item => {
          if (item.type !== 'video') {
            const fullSrc = withVersion(item.src);
            imageList.push({ src: fullSrc, fullSrc: fullSrc, caption: item.caption || '' });
          }
        });

        for (let setIdx = 0; setIdx < 3; setIdx++) {
          let lightboxIdx = 0;
          items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'gallery-item';

            if (item.type === 'video') {
              const vid = document.createElement('video');
              vid.src = withVersion(item.src);
              vid.autoplay = true; vid.loop = true; vid.muted = true; vid.playsInline = true;
              vid.setAttribute('disablePictureInPicture', '');
              vid.setAttribute('controlsList', 'nodownload nofullscreen noremoteplayback');
              div.appendChild(vid);
            } else {
              const img = document.createElement('img');
              const fullSrc = withVersion(item.src);
              img.src = fullSrc;
              img.alt = item.caption || '';
              img.loading = 'lazy';
              img.decoding = 'async';
              div.appendChild(img);

              img.addEventListener('load', function onLoad() {
                img.removeEventListener('load', onLoad);
                createThumbnail(fullSrc, 640, 480, 0.55).then(thumbUrl => {
                  if (thumbUrl !== fullSrc) img.src = thumbUrl;
                });
              }, { once: true });

              const currentIdx = lightboxIdx++;
              div.tabIndex = 0;
              div.setAttribute('role', 'button');
              div.setAttribute('aria-label', item.caption ? 'Open image: ' + item.caption : 'Open image');

              div.addEventListener('click', (e) => {
                if (e.detail === 0) return;
                if (carouselCtrl && carouselCtrl.shouldSuppressClick()) return;
                openLightbox(imageList, currentIdx);
              });
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

        carouselCtrl = initCarousel(container, { autoScroll: true, cloned: true });
        if (carouselCtrl) {
          carouselControllers.push(carouselCtrl);
          carouselCtrl.updateProgress();
          requestAnimationFrame(() => {
            const sw = container.scrollWidth / 3;
            if (sw > 0) { container.scrollLeft = sw; carouselCtrl.setFloatScroll(sw); carouselCtrl.updateProgress(); }
          });
        }
      })
      .catch(() => { container.classList.remove('is-loading'); showEmptyState(); });
  }

  loadGallery('photography.json', 'photo-gallery', 'photo-empty');
  loadGallery('animals.json', 'animals-gallery', 'animals-empty');
  loadGallery('sketches.json', 'sketches-gallery', 'sketches-empty');

  // ═══════════════════════════════════════════════════════════
  // POETRY / WRITING — Horizontal Carousel
  // ═══════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════
  // WRITING LIGHTBOX
  // ═══════════════════════════════════════════════════════════

  const writingLightbox = document.getElementById('writing-lightbox');
  const wlbContent = document.getElementById('writing-lb-content');
  const wlbMeta = document.getElementById('writing-lb-meta');
  const wlbClose = document.getElementById('writing-lb-close');
  const wlbPrev = document.getElementById('writing-lb-prev');
  const wlbNext = document.getElementById('writing-lb-next');
  let wlbPoems = [];
  let wlbIndex = 0;
  let wlbFontMap = {};
  let isWritingLightboxOpen = false;

  function openWritingLightbox(poems, index, fontMap) {
    if (!writingLightbox || !wlbContent) return;
    wlbPoems = poems;
    wlbIndex = index;
    wlbFontMap = fontMap;
    isWritingLightboxOpen = true;
    pauseAllCarousels();
    showWritingLightboxContent();
    writingLightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (mainContent) mainContent.setAttribute('aria-hidden', 'true');
    requestAnimationFrame(() => { if (wlbClose) wlbClose.focus(); });
  }

  function showWritingLightboxContent() {
    const poem = wlbPoems[wlbIndex];
    if (!poem || !wlbContent) return;
    const ff = wlbFontMap[poem.font] || '"Lora", serif';
    wlbContent.innerHTML = `
      <h3 class="wlb-title" style="font-family:${ff}">${poem.title}</h3>
      <div class="wlb-body" style="font-family:${ff}">${poem.body}</div>
      ${poem.meta ? `<p class="wlb-meta">${poem.meta}</p>` : ''}
    `;
    if (wlbMeta) wlbMeta.textContent = (wlbIndex + 1) + ' / ' + wlbPoems.length;
  }

  function closeWritingLightbox() {
    if (!writingLightbox) return;
    isWritingLightboxOpen = false;
    writingLightbox.classList.remove('open');
    document.body.style.overflow = '';
    if (mainContent) mainContent.removeAttribute('aria-hidden');
    resumeAllCarousels();
  }

  if (writingLightbox) {
    if (wlbClose) wlbClose.addEventListener('click', closeWritingLightbox);
    if (wlbPrev) wlbPrev.addEventListener('click', () => {
      if (wlbPoems.length) { wlbIndex = (wlbIndex - 1 + wlbPoems.length) % wlbPoems.length; showWritingLightboxContent(); }
    });
    if (wlbNext) wlbNext.addEventListener('click', () => {
      if (wlbPoems.length) { wlbIndex = (wlbIndex + 1) % wlbPoems.length; showWritingLightboxContent(); }
    });
    writingLightbox.addEventListener('click', (e) => {
      if (e.target === writingLightbox) closeWritingLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!writingLightbox.classList.contains('open') || !wlbPoems.length) return;
      if (e.key === 'Escape') { closeWritingLightbox(); return; }
      if (e.key === 'ArrowLeft') { wlbIndex = (wlbIndex - 1 + wlbPoems.length) % wlbPoems.length; showWritingLightboxContent(); return; }
      if (e.key === 'ArrowRight') { wlbIndex = (wlbIndex + 1) % wlbPoems.length; showWritingLightboxContent(); return; }
      if (e.key === 'Tab') {
        const focusable = [wlbClose, wlbPrev, wlbNext].filter(Boolean);
        if (focusable.length) {
          const first = focusable[0], last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // POETRY / WRITING — Horizontal Carousel
  // ═══════════════════════════════════════════════════════════

  fetch(withVersion('writing.json'), { cache: 'no-store' })
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(poems => {
      const emptyEl = document.getElementById('poetry-empty');
      const container = document.getElementById('poetry-container');
      const wrapperEl = container ? container.closest('.writing-gallery-wrapper') : null;

      if (!Array.isArray(poems) || !poems.length) {
        if (wrapperEl) wrapperEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
      }

      if (wrapperEl) wrapperEl.style.display = '';
      if (emptyEl) emptyEl.style.display = 'none';

      const fontMap = {
        'cormorant': '"Cormorant Garamond", serif',
        'playfair': '"Playfair Display", serif',
        'lora': '"Lora", serif',
        'eb-garamond': '"EB Garamond", serif',
        'spectral': '"Spectral", serif',
        'tiro-hindi': '"Tiro Devanagari Hindi", serif',
        'yatra': '"Yatra One", cursive',
        'noto-hindi': '"Noto Serif Devanagari", serif',
        'mukta': '"Mukta", sans-serif',
        'baloo': '"Baloo 2", cursive',
      };

      const shouldClone = poems.length >= 3;
      const repeatCount = shouldClone ? 3 : 1;
      let writingCtrl = null;

      for (let setIdx = 0; setIdx < repeatCount; setIdx++) {
        poems.forEach((poem, poemIdx) => {
          const card = document.createElement('div');
          card.className = 'poem-card';
          card.tabIndex = 0;
          card.setAttribute('role', 'button');
          card.setAttribute('aria-label', 'Read: ' + (poem.title || 'Writing'));
          const ff = fontMap[poem.font] || '"Lora", serif';
          card.innerHTML = `
            <h3 class="poem-title" style="font-family:${ff}">${poem.title}</h3>
            <div class="poem-body" style="font-family:${ff}">${poem.body}</div>
            ${poem.meta ? `<p class="poem-meta">${poem.meta}</p>` : ''}
          `;
          card.addEventListener('dragstart', (e) => e.preventDefault());

          // Click to open writing lightbox
          card.addEventListener('click', (e) => {
            if (e.detail === 0) return;
            if (writingCtrl && writingCtrl.shouldSuppressClick()) return;
            openWritingLightbox(poems, poemIdx, fontMap);
          });
          card.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            e.preventDefault();
            openWritingLightbox(poems, poemIdx, fontMap);
          });

          container.appendChild(card);
        });
      }

      if (shouldClone) container.dataset.autoscroll = 'true';

      writingCtrl = initCarousel(container, { autoScroll: shouldClone, cloned: shouldClone });
      if (writingCtrl) {
        carouselControllers.push(writingCtrl);
        writingCtrl.updateProgress();
        if (shouldClone) {
          requestAnimationFrame(() => {
            const sw = container.scrollWidth / 3;
            if (sw > 0) { container.scrollLeft = sw; writingCtrl.setFloatScroll(sw); writingCtrl.updateProgress(); }
          });
        }
      }
    })
    .catch(() => {
      const emptyEl = document.getElementById('poetry-empty');
      const wrapperEl = document.querySelector('.writing-gallery-wrapper');
      if (wrapperEl) wrapperEl.style.display = 'none';
      if (emptyEl) emptyEl.style.display = 'block';
    });

})();
