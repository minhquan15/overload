// Offline cache. App shell is cached at install; the 3D model and photos are cached the first
// time they are used. index.html is network-first so updates arrive whenever there is signal.
const VERSION = "8914175cc6";
const CACHE = "overload-" + VERSION;
const SHELL = ["./", "index.html", "manifest.webmanifest", "vendor/fonts.css", "vendor/three.min.js", "vendor/OrbitControls.js", "vendor/GLTFLoader.js", "vendor/RoomEnvironment.js", "vendor/fonts/b3f56918e7db.woff2", "vendor/fonts/03b2b5287817.woff2", "vendor/fonts/7ad5b2239bd6.woff2", "vendor/fonts/28c6fc478d5a.woff2", "vendor/fonts/678e7347cd50.woff2", "vendor/fonts/694ef762733e.woff2", "vendor/fonts/1375e457bc3e.woff2", "vendor/fonts/83f8c68f2437.woff2", "vendor/fonts/698bf1567b9d.woff2", "vendor/fonts/813dca14c283.woff2", "vendor/fonts/8962b9ca1448.woff2", "vendor/fonts/188b27967b7b.woff2", "vendor/fonts/aa210c0a6296.woff2", "vendor/fonts/c4f367306f9c.woff2", "vendor/fonts/15c8383bfc6f.woff2", "vendor/fonts/c5917192df07.woff2", "vendor/fonts/3b700bf55563.woff2", "vendor/fonts/a527e9872268.woff2", "vendor/fonts/3fad71f78ce6.woff2", "vendor/fonts/37e607610bce.woff2", "vendor/fonts/a7dec246000b.woff2", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("overload-") && k !== CACHE && k !== "overload-media").map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  if (req.mode === "navigate" || url.pathname.endsWith("/index.html")) {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put("index.html", copy)); return r; })
      .catch(() => caches.match("index.html")));
    return;
  }
  // model and photos survive app updates in their own cache
  const media = url.pathname.endsWith("/body.json") || url.pathname.includes("/img/");
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(media ? "overload-media" : CACHE).then(c => c.put(req, copy)); }
    return r;
  })));
});
