const CACHE_NAME = 'eventra-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/template.docx',
  '/facsign.png',
  '/favicon.svg',
  '/miclogo.png',
  '/vitclogo.png',
  '/swc.png',
  '/iic.png',
  '/mlsa.png',
  '/vnest.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-First strategy
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  // Navigation requests need the app shell when offline; static assets use
  // the cache when available and refresh in the background when online.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        if (networkResponse.status === 200 && e.request.url.startsWith(self.location.origin)) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, cacheCopy);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(e.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          
          if (e.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          
          return new Response('Offline mode enabled. Some assets might be unavailable.', {
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});
