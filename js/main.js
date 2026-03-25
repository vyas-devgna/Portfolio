/* ═══════════════════════════════════════════════════════════
   MAIN.JS — Navigation, Scroll Reveals, Galleries, Resume
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Navbar scroll effect ──
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    // Active nav link
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
  const revealElements = document.querySelectorAll('.reveal');
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
  revealElements.forEach(el => revealObserver.observe(el));

  // ── Smart resume detection ──
  function checkResume() {
    const files = ['resume.pdf', 'cv.pdf', 'Resume.pdf', 'CV.pdf'];
    files.forEach(file => {
      fetch(file, { method: 'HEAD' })
        .then(res => {
          if (res.ok) {
            document.querySelectorAll('[id^="resume-"]').forEach(btn => {
              btn.style.display = 'inline-flex';
              btn.href = file;
            });
          }
        })
        .catch(() => {});
    });
  }
  checkResume();

  // ── Photography gallery ──
  function loadGallery(jsonFile, containerId, emptyId) {
    fetch(jsonFile)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(items => {
        if (!items.length) { document.getElementById(emptyId).style.display = 'block'; return; }
        const container = document.getElementById(containerId);
        const images = [];

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
            vid.style.pointerEvents = 'none';
            div.appendChild(vid);
          } else {
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.caption || '';
            img.loading = 'lazy';
            div.appendChild(img);
            images.push({ src: item.src, caption: item.caption || '' });
            div.addEventListener('click', () => openLightbox(images, images.length - 1));
          }

          if (item.caption) {
            const cap = document.createElement('div');
            cap.className = 'gallery-caption';
            cap.textContent = item.caption;
            div.appendChild(cap);
          }

          container.appendChild(div);
        });
      })
      .catch(() => {
        document.getElementById(emptyId).style.display = 'block';
      });
  }

  loadGallery('photography.json', 'photo-gallery', 'photo-empty');
  loadGallery('animals.json', 'animals-gallery', 'animals-empty');
  loadGallery('sketches.json', 'sketches-gallery', 'sketches-empty');

  // ── Lightbox ──
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

  document.getElementById('lightbox-close').addEventListener('click', () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  });

  document.getElementById('lightbox-prev').addEventListener('click', () => {
    lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
    showLightboxImage();
  });

  document.getElementById('lightbox-next').addEventListener('click', () => {
    lbIndex = (lbIndex + 1) % lbImages.length;
    showLightboxImage();
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') { lightbox.classList.remove('open'); document.body.style.overflow = ''; }
    if (e.key === 'ArrowLeft') { lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length; showLightboxImage(); }
    if (e.key === 'ArrowRight') { lbIndex = (lbIndex + 1) % lbImages.length; showLightboxImage(); }
  });

  // ── Poetry / Writing ──
  fetch('writing.json')
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(poems => {
      if (!poems.length) { document.getElementById('poetry-empty').style.display = 'block'; return; }
      const container = document.getElementById('poetry-container');
      poems.forEach(poem => {
        const card = document.createElement('div');
        card.className = 'poem-card reveal';

        const fontMap = {
          'cormorant':    '"Cormorant Garamond", serif',
          'playfair':     '"Playfair Display", serif',
          'lora':         '"Lora", serif',
          'eb-garamond':  '"EB Garamond", serif',
          'spectral':     '"Spectral", serif',
          'tiro-hindi':   '"Tiro Devanagari Hindi", serif',
          'yatra':        '"Yatra One", cursive',
          'noto-hindi':   '"Noto Serif Devanagari", serif',
          'mukta':        '"Mukta", sans-serif',
          'baloo':        '"Baloo 2", cursive',
        };

        const fontFamily = fontMap[poem.font] || '"Lora", serif';

        card.innerHTML = `
          <h3 class="poem-title" style="font-family:${fontFamily}">${poem.title}</h3>
          <div class="poem-body" style="font-family:${fontFamily}">${poem.body}</div>
          ${poem.meta ? `<p class="poem-meta">${poem.meta}</p>` : ''}
        `;
        container.appendChild(card);
      });

      // Re-observe newly added elements
      document.querySelectorAll('.poem-card.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
    })
    .catch(() => {
      document.getElementById('poetry-empty').style.display = 'block';
    });

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
