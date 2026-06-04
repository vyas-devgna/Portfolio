/* ═══════════════════════════════════════════════════════════
   MAIN.JS — Nav, Theme Toggle, Typed Text, Scroll Progress,
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
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'light' ? 'dark' : 'light';
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
  // CONTACT FORM LOGIC (FORMSPREE)
  // ═══════════════════════════════════════════════════════════
  
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameInput = document.getElementById('contact-name');
      if (nameInput && nameInput.value) {
        try { localStorage.setItem('portfolio_visitor_name', nameInput.value); } catch(_) {}
      }
      
      if (formStatus) formStatus.textContent = 'Sending...';
      
      const data = new FormData(contactForm);
      fetch(contactForm.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      })
      .then(response => {
        if (response.ok) {
          contactForm.reset();
          if (formStatus) formStatus.textContent = 'Message sent successfully!';
          setTimeout(() => { if (formStatus) formStatus.textContent = ''; }, 4000);
        } else {
          if (formStatus) formStatus.textContent = 'Oops! There was a problem submitting your form.';
        }
      })
      .catch(() => {
        if (formStatus) formStatus.textContent = 'Oops! There was a network error.';
      });
    });
  }

  // ═══════════════════════════════════════════════════════════
  // WELCOME OVERLAY
  // ═══════════════════════════════════════════════════════════

  function showWelcomeOverlay() {
    let visitorName = null;
    try { visitorName = localStorage.getItem('portfolio_visitor_name'); } catch(_) {}
    
    if (visitorName) {
      document.body.style.overflow = 'hidden';
      
      const overlay = document.createElement('div');
      overlay.className = 'welcome-overlay';
      
      overlay.innerHTML = `
        <h2>Welcome back, ${visitorName}.</h2>
        <p>Let's pick up right where we left off. The systems are ready.</p>
        <button class="btn-brutal btn-brutal-accent">Enter Portfolio</button>
      `;
      
      document.body.appendChild(overlay);
      
      setTimeout(() => overlay.classList.add('show'), 100);
      
      const btn = overlay.querySelector('button');
      btn.addEventListener('click', () => {
        overlay.classList.remove('show');
        document.body.style.overflow = '';
        setTimeout(() => overlay.remove(), 500);
      });
    }
  }

  setTimeout(showWelcomeOverlay, 300);

})();
