// Service Worker Principal (Raíz) para La Súper Viborita Glotona
const CACHE_NAME = 'viborita-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './game.js',
  './instalar/pwa.js',
  './instalar/manifest.json',
  './instalar/icon-192.png',
  './instalar/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW Principal] Cache abierto. Guardando archivos del juego...');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('[SW Principal] Error durante install caching:', err))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retornar recurso cacheado o buscar en la red
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[SW Principal] Eliminando cache obsoleto:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});
