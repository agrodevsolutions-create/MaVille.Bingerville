// Service worker amélioré — précache + runtime caching
const PRECACHE = 'maville-precache-v2';
const RUNTIME = 'maville-runtime-v1';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/style.css',
  '/script.js',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(PRECACHE).then(cache => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== PRECACHE && key !== RUNTIME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

// Simple helper to put response in cache
async function cachePut(cacheName, request, response) {
  const cache = await caches.open(cacheName);
  try {
    await cache.put(request, response.clone());
  } catch (e) {
    // ignore put errors (opaque requests etc.)
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;

  // Ignore non-GET
  if (request.method !== 'GET') return;

  // Navigation requests — Network first, fallback to cache (index.html)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(response => {
        cachePut(RUNTIME, request, response);
        return response;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  const url = new URL(request.url);

  // Images: cache-first
  if (request.destination === 'image' || url.pathname.startsWith('/images/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(resp => { cachePut(RUNTIME, request, resp); return resp; }))
    );
    return;
  }

  // CSS/JS/Fonts: stale-while-revalidate
  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'font') {
    event.respondWith(
      caches.match(request).then(cached => {
        const networkFetch = fetch(request).then(resp => { cachePut(RUNTIME, request, resp); return resp; }).catch(() => null);
        return cached || networkFetch;
      })
    );
    return;
  }

  // Default: try cache, otherwise network
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(resp => { cachePut(RUNTIME, request, resp); return resp; }))
  );
});

// Allow page to trigger skipWaiting via postMessage
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
