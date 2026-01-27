self.addEventListener('install', (e) => {
  self.skipWaiting(); 
});

self.addEventListener('activate', (e) => {
  // 1. Delete the File Caches (The stuff making the site "stale")
  e.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(names.map(name => caches.delete(name)));
    })
  );

  // 2. Unregister this worker so it doesn't interfere again
  self.registration.unregister()
    .then(() => {
      console.log('SW Unregistered. Progress remains safe.');
    });
});