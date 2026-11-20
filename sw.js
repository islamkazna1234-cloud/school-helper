// Service worker: приложение работает как установленное и быстро открывается.
// ВАЖНО: при каждом изменении файлов увеличивайте номер версии (v4 → v5 → ...),
// чтобы у всех учеников обновился сохранённый кэш.
const CACHE_NAME = "school-help-v4";
const FILES = [
  "./", "./index.html", "./manifest.json",
  "./icons/icon-192.png", "./icons/icon-512.png",
  "./icons/icon-maskable-512.png", "./icons/apple-touch-icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Сначала кэш (быстро), в фоне обновляем из сети. Запросы к базе данных не кэшируются.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE_NAME).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => cached || (req.mode === "navigate" ? caches.match("./index.html") : undefined));
      return cached || network;
    })
  );
});
