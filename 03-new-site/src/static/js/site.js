// KT INDIA site script: old-link redirects, contact-form enhancement. ~2 KB, no dependencies.
(function () {
  'use strict';

  // 1. Old single-page anchors (www.kavaiyatech.com/#services etc.) -> new pages.
  var HASH_MAP = {
    '/': {
      home: '/', about: '/about/', sectors: '/about/#sectors', products: '/work/#annaveda',
      services: '/services/', research: '/work/#research', publications: '/work/#publications',
      join: '/careers/', contact: '/contact/',
      'custom-software-development': '/services/custom-software-development/',
      'erp-point-of-sale': '/services/erp-point-of-sale/',
      'smart-contract-development': '/services/smart-contract-development/',
      'graphics-ui-ux-design': '/services/ui-ux-graphic-design/',
      'pcb-electronic-design': '/services/pcb-electronic-design/',
      'ai-ml-development': '/services/ai-ml-development/',
      'ip-protocol-development': '/services/ip-protocol-development/',
      'research-technology-consulting': '/services/research-technology-consulting/'
    },
    // /policies.html is 301-redirected to /privacy/ by the server; its fragments arrive here.
    '/privacy/': { terms: '/terms/#terms', disclaimer: '/terms/#disclaimer', applications: '/terms/#applications' }
  };
  var map = HASH_MAP[location.pathname];
  var hash = location.hash.slice(1);
  if (map && hash && map[hash] && map[hash] !== location.pathname) {
    location.replace(map[hash]);
    return;
  }

  // 2. Theme toggle: flips between light and dark and remembers the choice.
  var root = document.documentElement;
  var themeBtn = document.getElementById('theme-btn');
  var dark = window.matchMedia('(prefers-color-scheme: dark)');
  function current() { return root.getAttribute('data-theme') || (dark.matches ? 'dark' : 'light'); }
  function label() { if (themeBtn) themeBtn.setAttribute('aria-label', 'Switch to ' + (current() === 'dark' ? 'light' : 'dark') + ' theme'); }
  if (themeBtn) {
    label();
    themeBtn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('kt-theme', next); } catch (e) {}
      label();
    });
    dark.addEventListener && dark.addEventListener('change', label);
  }

  // 3. Hero mark: ribbons drift with the pointer (mouse/pen only, never under reduced motion).
  var art = document.getElementById('hero-art');
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (art && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !still.matches) {
    var raf = 0;
    document.addEventListener('pointermove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var r = art.getBoundingClientRect();
        var x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width)));
        var y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height)));
        art.style.setProperty('--px', x.toFixed(3));
        art.style.setProperty('--py', y.toFixed(3));
      });
    }, { passive: true });
  }

  // 4. Card spotlight follows the pointer (mouse/pen only; touch and keyboard use :focus-within styles).
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.addEventListener('pointermove', function (e) {
      var card = e.target.closest && e.target.closest('.svc-card');
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  // 5. Close the mobile menu when a link inside it is chosen.
  var nav = document.getElementById('site-nav');
  if (nav && nav.hidePopover) {
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && nav.matches(':popover-open')) nav.hidePopover();
    });
  }

  // 6. Contact form: preselect service from ?service=, submit without leaving the page.
  var form = document.getElementById('contact-form');
  if (!form) return;
  var select = document.getElementById('f-service');
  var wanted = new URLSearchParams(location.search).get('service');
  if (wanted && select) {
    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].value === wanted) { select.selectedIndex = i; break; }
    }
  }
  var status = document.getElementById('form-status');
  function say(msg, kind) { status.textContent = msg; status.className = 'form-status ' + (kind || ''); }

  form.addEventListener('submit', function (e) {
    if (!window.fetch || !window.FormData) return; // fall back to normal POST
    e.preventDefault();
    if (form.action.indexOf('FORM_ID') !== -1) {
      say('The form is not connected yet. Please email contact@kavaiyatech.com.', 'is-error');
      return;
    }
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    say('Sending…');
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (r) {
        if (!r.ok) throw new Error(String(r.status));
        form.reset();
        say('Thank you. Your enquiry has been sent and we will reply by email.', 'is-ok');
      })
      .catch(function () {
        say('Sorry, the message could not be sent. Please email contact@kavaiyatech.com or use WhatsApp.', 'is-error');
      })
      .then(function () { btn.disabled = false; });
  });
})();
