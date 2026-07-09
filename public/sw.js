const CACHE_NAME = 'mic-reporter-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/template.docx',
  '/facsign.png',
  '/favicon.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request).catch(() => {
        // Fallback for document fetch when offline
        return new Response('Offline mode enabled. Some assets might be unavailable.', {
          headers: { 'Content-Type': 'text/plain' }
        });
      });
    })
  );
});
