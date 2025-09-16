const CACHE_NAME = 'cafe-pos-v1';
const urlsToCache = [
  '/',
  '/kitchen',
  '/src/main.tsx',
  '/src/index.css',
  '/src/assets/cappuccino.jpg',
  '/src/assets/espresso.jpg',
  '/src/assets/iced-tea.jpg',
  '/src/assets/bubble-tea.jpg'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});