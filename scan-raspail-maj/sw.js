// Scan Étiquettes – mise en cache pour ouvrir l'appli même sans réseau.
const CACHE = "scan-etiquettes-v2";
const FILES = ["./", "./index.html", "./zxing.min.js", "./zxing-wasm-reader.js", "./zxing_reader.wasm", "./manifest.webmanifest", "./apple-touch-icon.png", "./icon-192.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Fichiers de l'appli : réseau d'abord (pour recevoir les mises à jour), cache si hors ligne.
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
