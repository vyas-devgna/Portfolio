/* Devgna Vyas — PWA layer: service worker, install affordance, update notice.
   Everything here is optional; the site is fully usable without it. */
(() => {
  'use strict';

  const root = document.documentElement;
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (standalone()) root.classList.add('is-standalone');
  matchMedia('(display-mode: standalone)').addEventListener('change', () => root.classList.toggle('is-standalone', standalone()));

  const toastEl = document.querySelector('.toast');
  let toastTimer = 0;
  const toast = (msg, ms = 3200) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), ms);
  };

  /* ---- service worker ---- */
  const secure = location.protocol === 'https:' || location.hostname === 'localhost';
  if ('serviceWorker' in navigator && secure) {
    window.addEventListener('load', async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        // A new worker finished installing while an old one is in control → tell the visitor.
        reg.addEventListener('updatefound', () => {
          const next = reg.installing;
          next?.addEventListener('statechange', () => {
            if (next.state === 'installed' && navigator.serviceWorker.controller) toast('Updated — refresh for the latest version.', 5000);
          });
        });
      } catch {
        /* offline support is a bonus; ignore registration failures */
      }
    });
  }

  /* ---- install affordance (footer, hidden until installable) ---- */
  const btn = document.querySelector('[data-install]');
  if (!btn) return;
  let deferred = null;
  const label = btn.querySelector('span');
  const show = (text) => { if (label && text) label.textContent = text; btn.hidden = false; };

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferred = event;
    if (!standalone()) show('Install app');
  });
  window.addEventListener('appinstalled', () => { deferred = null; btn.hidden = true; toast('Installed — find it on your home screen or app list.'); });

  // iOS Safari has no install event; it's Share → Add to Home Screen.
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (ios && !standalone()) show('Add to Home Screen');

  btn.addEventListener('click', async () => {
    if (deferred) {
      deferred.prompt();
      const { outcome } = await deferred.userChoice;
      deferred = null;
      if (outcome === 'accepted') btn.hidden = true;
      return;
    }
    if (ios) toast('Tap the Share icon, then “Add to Home Screen”.', 6000);
  });
})();
