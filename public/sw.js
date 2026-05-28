const CACHE_NAME = "kroo-v2";

// Install: activate immediately, don't pre-cache anything that could fail
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Activate: clean up old caches and take control immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first for everything, cache static assets as a side effect
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Never intercept Supabase or API calls
  if (url.hostname.includes("supabase")) return;

  // Navigation: network-first, no fallback (let it fail naturally)
  if (request.mode === "navigate") {
    event.respondWith(fetch(request));
    return;
  }

  // Static assets (icons, fonts, Next.js chunks): cache after first fetch
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/_next/static/")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
  }
});
