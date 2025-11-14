// service-worker.js

const CACHE_NAME = 'chefstack-cache-v1';

// Pre-cache the essential app shell files on install.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching app shell');
        return cache.addAll([
          '/',
          '/index.html',
        ]);
      })
  );
});

// Use a network-first, falling back to cache strategy.
// This is good for keeping data fresh while providing offline support.
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If the fetch is successful, clone the response and cache it.
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If the fetch fails (e.g., user is offline), try to get the response from the cache.
        return caches.match(event.request);
      })
  );
});

// Clean up old caches on activation.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle push notifications.
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'ChefStack', body: 'You have a new notification.' };
  
  const options = {
    body: data.body,
    icon: '/chefstack-icon.png', // Optional: Add an icon file to the root directory
    badge: '/chefstack-badge.png', // Optional: A smaller icon for the notification bar
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
