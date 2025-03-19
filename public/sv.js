self.addEventListener("install", (event) => {
    console.log("Service Worker installé ✅");
    self.skipWaiting(); // Active immédiatement
});

self.addEventListener("activate", (event) => {
    console.log("Service Worker activé ✅");
    return self.clients.claim(); // Prend le contrôle immédiatement
});
self.addEventListener('fetch', () => {});
