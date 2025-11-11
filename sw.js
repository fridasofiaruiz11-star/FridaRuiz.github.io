const CACHE_NAME = 'Fitsyle-pwa-v2';
const PRECACHE_URLS = [
  './',
  './index.html?homescreen=v2',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k))))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cached => 
      cached || fetch(event.request).then(resp => {
        try {
          if (event.request.method === 'GET') {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
        } catch (e) {}
        return resp;
      }).catch(() => {
        if (event.request.destination === 'document') return caches.match('./index.html');
        return new Response('', { status: 503, statusText: 'Offline' });
      })
    )
  );
});