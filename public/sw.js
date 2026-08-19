const CACHE_NAME = 'duotracker-v3';
const urlsToCache = ['/', '/index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(cacheNames.map((cache) => (cache !== CACHE_NAME ? caches.delete(cache) : undefined)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // لا تتدخل إطلاقاً في أي طلب غير GET (مثل POST/PATCH لـ Supabase) أو أي طلب خارج نفس النطاق
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  // network-first لصفحة index.html نفسها لتفادي مشاكل الكاش القديم بعد أي نشر جديد
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(req, res.clone()));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // باقي ملفات الواجهة الثابتة: cache-first عادي
  event.respondWith(caches.match(req).then((res) => res || fetch(req)));
});
