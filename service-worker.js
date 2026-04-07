const CACHE_NAME = 'dashboard-v3';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './Journaling.pdf'
];

// Install event - cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(response => {
          // Don't cache if not a successful response
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Network request failed, return offline page if needed
        return new Response('Offline - content not available', { status: 503 });
      })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const appUrl = self.registration.scope;
  
  // Open the app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.startsWith(appUrl) && 'focus' in client) {
          return client.focus();
        }
      }

      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(appUrl);
      }
    })
  );
});

