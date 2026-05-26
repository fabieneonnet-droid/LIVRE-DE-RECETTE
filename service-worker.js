const CACHE_NAME = "recettes-v1";

// Installation du Service Worker
self.addEventListener("install", (e) => {
  self.skipWaiting();
});

// Activation
self.addEventListener("activate", (e) => {
  return self.clients.claim();
});

// Gestion des requêtes (intercepte pour le fonctionnement hors-ligne si besoin plus tard)
self.addEventListener("fetch", (e) => {
  // Laisse passer les requêtes normalement vers Supabase/le réseau
  e.respondWith(fetch(e.request));
});
