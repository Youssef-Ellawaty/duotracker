const CACHE_NAME = 'duotracker-v4'; // غيّر النسخة عشان الكاش القديم يتشال
const urlsToCache = ['/', '/index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.map((n) => (n !== CACHE_NAME ? caches.delete(n) : undefined))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone)).catch(() => {});
          return res;
        } catch {
          const cached = await caches.match(req);
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      const res = await fetch(req);
      try {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone)).catch(() => {});
      } catch {}
      return res;
    })()
  );
});
