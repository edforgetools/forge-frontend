// Service Worker for caching static assets
const CACHE_NAME = "forge-frontend-v1";
const STATIC_ASSETS = ["/", "/index.html", "/vite.svg", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Only cache assets that exist and don't fail
      return Promise.allSettled(
        STATIC_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.log(`Failed to cache ${asset}:`, err);
            return null;
          })
        )
      );
    })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version if available
      if (response) {
        return response;
      }

      // Fetch from network with error handling
      return fetch(event.request).catch(() => {
        // If fetch fails, return a fallback response for navigation requests
        if (event.request.mode === "navigate") {
          return caches.match("/index.html");
        }
        // For other requests, let them fail naturally
        throw new Error("Network request failed");
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all clients immediately
  return self.clients.claim();
});
