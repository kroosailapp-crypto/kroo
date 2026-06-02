const CACHE_NAME = "kroo-v3";
const TIMER_CACHE = "kroo-timer-v1";

// Assets to pre-cache for the race timer offline experience
const TIMER_PRECACHE = [
  "/race-timer",
  "/race-timer-manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-180.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  // Pre-cache race timer shell on install
  event.waitUntil(
    caches.open(TIMER_CACHE).then((cache) => cache.addAll(TIMER_PRECACHE).catch(() => {}))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== TIMER_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.hostname.includes("supabase")) return;

  // Race timer pages/assets: cache-first for offline support
  const isTimerRoute =
    url.pathname === "/race-timer" ||
    url.pathname.startsWith("/race-timer/") ||
    url.pathname === "/race-timer-manifest.json";

  const isStaticAsset =
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/_next/static/");

  if (isTimerRoute || isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        // Serve from cache immediately, update in background
        const networkFetch = fetch(request)
          .then((response) => {
            if (response.ok) {
              const cacheName = isTimerRoute ? TIMER_CACHE : CACHE_NAME;
              caches.open(cacheName).then((cache) => cache.put(request, response.clone()));
            }
            return response;
          })
          .catch(() => cached); // fall back to cache if network fails

        return cached || networkFetch;
      })
    );
    return;
  }

  // All other navigation: network-first, no offline fallback
  if (request.mode === "navigate") {
    event.respondWith(fetch(request));
  }
});
