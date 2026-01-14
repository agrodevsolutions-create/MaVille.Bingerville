// Service Worker pour MaVille – Bingerville
const PRECACHE = 'maville-precache-v3';
const RUNTIME = 'maville-runtime-v2';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/script.js',
  // Icônes au format PNG (conformes à manifest.json)
  '/icon-192.png',
  '/icon-512.png'
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
      keys.filter(key => ![PRECACHE, RUNTIME].includes(key)).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

async function cachePut(cacheName, request, response) {
  const cache = await caches.open(cacheName);
  try {
    await cache.put(request, response.clone());
  } catch (e) {
    // Ignorer les erreurs (ex: requêtes opaques)
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // 🔒 Ne jamais intercepter les appels Supabase
  if (url.origin === 'https://wpojhdxjrekypkwbjsfd.supabase.co') {
    return;
  }

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') return;

  // Navigation : Network first, fallback sur index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Images locales : cache-first
  if (
    request.destination === 'image' || 
    url.pathname.startsWith('/images/') || 
    url.pathname.match(/\.(png|jpg|jpeg|webp|svg)$/)
  ) {
    event.respondWith(
      caches.match(request).then(cached => 
        cached || fetch(request).then(resp => { cachePut(RUNTIME, request, resp); return resp; })
      )
    );
    return;
  }

  // CSS/JS/Fonts : stale-while-revalidate
  if (['style', 'script', 'font'].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then(cached => {
        const networkFetch = fetch(request).then(resp => { cachePut(RUNTIME, request, resp); return resp; });
        return cached || networkFetch;
      })
    );
    return;
  }

  // Autres ressources : network first
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Gestion des mises à jour
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
