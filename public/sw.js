const CACHE = 'muchwater-v3-manufacturer';
const CORE_ASSETS = ['/manifest.webmanifest', '/muchwater.svg'];

async function cacheBuiltApp() {
  const cache = await caches.open(CACHE);
  const indexResponse = await fetch('/');
  const html = await indexResponse.clone().text();
  await cache.put('/', indexResponse);

  const assetPaths = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)]
    .map((match) => match[1])
    .filter((path) => path.startsWith('/'));

  await cache.addAll([...new Set([...CORE_ASSETS, ...assetPaths])]);
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheBuiltApp());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && new URL(event.request.url).origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === 'navigate') return caches.match('/');
        return Response.error();
      }),
  );
});
