// VisitFlow Service Worker - offline-first PWA
const CACHE_VERSION = "v3";
const CACHE_NAME = `visitflow-${CACHE_VERSION}`;
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/offline.html",
  "/icons/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
];
const NAVIGATION_CACHE = `${CACHE_NAME}-pages`;
const RUNTIME_CACHE = `${CACHE_NAME}-runtime`;
const STATIC_ASSET_PATTERN = /\.(?:js|css|png|jpg|jpeg|svg|gif|webp|avif|ico|woff2?)$/i;

const sameOrigin = (url) => url.origin === self.location.origin;

const precacheBuildAssets = async (cache) => {
  const response = await fetch("/", { cache: "no-store" });
  if (!response.ok) return;

  const html = await response.clone().text();
  await cache.put("/", response);

  const urls = new Set();
  for (const match of html.matchAll(/<(?:script|link)[^>]+(?:src|href)="([^"]+)"/g)) {
    const url = new URL(match[1], self.location.origin);
    if (sameOrigin(url) && STATIC_ASSET_PATTERN.test(url.pathname)) {
      urls.add(url.pathname);
    }
  }

  await Promise.all([...urls].map((url) => cache.add(url).catch(() => undefined)));
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(async (cache) => {
        await cache.addAll(APP_SHELL);
        await precacheBuildAssets(cache);
      })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k.startsWith("visitflow-") && !k.startsWith(CACHE_NAME)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (!sameOrigin(url) || url.pathname.startsWith("/api/")) return;

  // Network-first for navigation requests, fallback to cache (offline).
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (!res.ok) {
            return caches.match("/index.html").then((cached) => cached || res);
          }

          const copy = res.clone();
          caches.open(NAVIGATION_CACHE).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() =>
          caches
            .match(request)
            .then((r) => r || caches.match("/index.html"))
            .then((r) => r || caches.match("/offline.html"))
        )
    );
    return;
  }

  // Cache-first for static assets (JS, CSS, images, fonts).
  if (!STATIC_ASSET_PATTERN.test(url.pathname)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        if (res && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
