const CACHE_NAME = "barry63-cache-v1";
const OFFLINE_URL = "phone1.html";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/siteimages/appicon.png",
  OFFLINE_URL
];

self.addEventListener("install", (event) => {
  // Try caching, but fail silently if blocked
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    ).catch(() => {}) // fail silently if cache not allowed
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    }).catch(() => {
      // If cache is blocked and offline, show main iframe page
      if (event.request.mode === "navigate") {
        return fetch(OFFLINE_URL).catch(() => new Response("Offline not available", { status: 503 }));
      }
    })
  );
});
