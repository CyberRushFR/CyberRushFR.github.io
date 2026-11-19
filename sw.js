// Garde la page du jeu en mémoire sur le téléphone pour qu'elle s'ouvre sans Internet.
const CACHE = "cyberrush-b3cfe95dd8";
const PAGE = new URL("./index.html", self.registration.scope).href;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll([PAGE])).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function staleWhileRevalidate(event, cacheKey) {
  return caches.open(CACHE).then((cache) =>
    cache.match(cacheKey).then((cached) => {
      const network = fetch(event.request)
        .then((res) => { if (res && (res.ok || res.type === "opaque")) cache.put(cacheKey, res.clone()); return res; })
        .catch(() => cached);
      if (cached) { event.waitUntil(network.catch(() => {})); return cached; }
      return network;
    })
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (req.mode === "navigate" && url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(event, PAGE));
  } else if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(staleWhileRevalidate(event, req));
  }
});
