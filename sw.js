/* Devgna Vyas — service worker.
   Strategy: the page always tries the network first (so updates ship instantly) and falls back
   to the cached copy when offline; static assets are served from cache and refreshed in the background.
   Bump VERSION to invalidate everything. */
const VERSION = 'v6';
const SHELL = `shell-${VERSION}`;
const RUNTIME = `runtime-${VERSION}`;
const IMAGES = `images-${VERSION}`;
const MAX_IMAGES = 70;

const PRECACHE = [
  '/', '/css/style.css', '/css/fonts.css', '/js/bootstrap.js', '/js/main.js', '/js/pwa.js',
  '/gallery.json', '/manifest.webmanifest',
  '/images/logo.webp', '/images/portrait.webp', '/images/og.jpg',
  '/images/work/liwm.webp', '/images/work/braids.webp', '/images/work/ez-drop.webp', '/images/work/beatblocks.webp',
  '/images/icon-192.png', '/images/apple-touch-icon.png', '/images/favicon-32.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const shell = await caches.open(SHELL);
    // Cache the core UI; optional desktop animation libraries load only when needed.
    await shell.addAll(PRECACHE.map((u) => new Request(u, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keep = new Set([SHELL, RUNTIME, IMAGES]);
    for (const key of await caches.keys()) if (!keep.has(key)) await caches.delete(key);
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
    await self.clients.claim();
  })());
});

const trim = async (name, max) => {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i += 1) await cache.delete(keys[i]);
};

const staleWhileRevalidate = async (event, cacheName) => {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(event.request);
  const refresh = fetch(event.request).then((res) => {
    if (res && (res.ok || res.type === 'opaque')) cache.put(event.request, res.clone());
    return res;
  }).catch(() => undefined);
  if (cached) { event.waitUntil(refresh); return cached; }
  return (await refresh) || Response.error();
};

// Unhashed site files (css/js/json): prefer the network so a deploy is visible on the next load,
// fall back to the cache when offline or slow.
const networkFirst = async (event, cacheName, timeoutMs = 4000) => {
  const cache = await caches.open(cacheName);
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), timeoutMs);
    const res = await fetch(event.request, { signal: ctl.signal });
    clearTimeout(timer);
    if (res.ok) cache.put(event.request, res.clone());
    return res;
  } catch {
    return (await cache.match(event.request)) || Response.error();
  }
};

const cacheFirst = async (event, cacheName, max) => {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(event.request);
  if (cached) return cached;
  const res = await fetch(event.request);
  if (res.ok) { cache.put(event.request, res.clone()); event.waitUntil(trim(cacheName, max)); }
  return res;
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || request.headers.has('range')) return;
  const url = new URL(request.url);
  if (!/^https?:$/.test(url.protocol)) return;

  // The blog feed is live data: always network, never cached by the worker.
  if (url.hostname === 'blog.vyasdevgna.online') return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preload = await event.preloadResponse;
        const res = preload || await fetch(request);
        const cache = await caches.open(SHELL);
        if (res.ok && url.origin === location.origin) cache.put('/', res.clone());
        return res;
      } catch {
        return (await caches.match('/')) || Response.error();
      }
    })());
    return;
  }

  if (url.origin === location.origin) {
    if (/\.(?:png|jpe?g|webp|avif|gif|svg|ico)$/i.test(url.pathname)) {
      event.respondWith(cacheFirst(event, IMAGES, MAX_IMAGES));
    } else {
      event.respondWith(networkFirst(event, SHELL));
    }
    return;
  }

  if (/(?:fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(url.hostname)) {
    event.respondWith(staleWhileRevalidate(event, RUNTIME));
  }
});

self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});
