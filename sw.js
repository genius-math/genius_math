self.addEventListener('install', (e) => {
  console.log('Service Worker: Installed');
});

self.addEventListener('fetch', (e) => {
  // هذا الكود يضمن عمل التطبيق بسلاسة
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});