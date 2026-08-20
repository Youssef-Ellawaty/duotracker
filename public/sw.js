const CACHE_NAME = 'duotracker-v5';
const urlsToCache = ['/', '/index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.map((n) => (n !== CACHE_NAME ? caches.delete(n) : undefined)))
    )
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
          // Clone immediately, before returning res to the browser. The browser
          // starts consuming res's body as soon as it's returned from
          // respondWith(), so cloning later inside a .then() callback races
          // against that consumption and throws "body already used".
          const resToCache = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resToCache)).catch(() => {});
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
        const resToCache = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resToCache)).catch(() => {});
      } catch {}
      return res;
    })()
  );
});
