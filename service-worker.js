const CACHE_NAME = "grimoire-recettes-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./index.js",
  "./manifest.json",
];

// Installation : Mise en cache des fichiers de base
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }),
  );
  self.skipWaiting();
});

// Activation
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        }),
      );
    }),
  );
  return self.clients.claim();
});

// Interception des requêtes pour que Chrome valide la PWA
self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    }),
  );
});
