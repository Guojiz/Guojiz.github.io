// Word Snap has moved to /word-snap/.
// This worker replaces the old /word-match/ service worker: it clears the old
// caches, unregisters itself, and sends any open clients to the new location.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((clients) => Promise.all(clients.map((client) => client.navigate("/word-snap/"))))
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(Response.redirect("/word-snap/", 302));
  }
});
