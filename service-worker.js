// service-worker.js - Enhanced PWA Support with Mobile Optimization

const CACHE_NAME = 'chefstack-cache-v3';
const DYNAMIC_CACHE = 'chefstack-dynamic-v3';
const API_CACHE = 'chefstack-api-v3';
const IMAGE_CACHE = 'chefstack-images-v3';

// Essential app shell files
const APP_SHELL = [
  '/',
  '/index.html',
  '/styles/mobile.css',
  '/assets/index.css',
  '/assets/index.js',
];

// API endpoints to cache
const API_URLS = [
  '/api/recipes',
  '/api/inventory',
  '/api/haccp',
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(APP_SHELL);
      })
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  const cacheWhitelist = [CACHE_NAME, DYNAMIC_CACHE, API_CACHE, IMAGE_CACHE];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control immediately
  );
});

// Fetch event - network-first for API, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle Supabase API requests (network-first with cache fallback)
  if (url.hostname.includes('supabase')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone and cache successful responses
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache when offline
          return caches.match(request).then(cached => {
            return cached || new Response(
              JSON.stringify({ error: 'Offline - cached data unavailable' }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }

  // Handle app shell and static assets (cache-first)
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(request)
        .then(cached => {
          if (cached) {
            return cached;
          }
          
          // Not in cache, fetch from network
          return fetch(request).then(response => {
            // Cache dynamic content
            if (response && response.status === 200) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE).then(cache => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
        })
        .catch(() => {
          // Offline fallback for HTML pages
          if (request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
        })
    );
    return;
  }

  // For everything else, network-first
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  );
});

// Handle push notifications for HACCP alerts
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const data = event.data ? event.data.json() : { 
    title: 'ChefStack', 
    body: 'Νέα ειδοποίηση',
    type: 'general'
  };
  
  // Icon and badge based on notification type
  let icon = '/chefstack-icon.png';
  let badge = '/chefstack-badge.png';
  
  if (data.type === 'haccp_alert') {
    icon = '⚠️'; // Or path to warning icon
    badge = '🔔';
  } else if (data.type === 'haccp_overdue') {
    icon = '🚨'; // Or path to urgent icon
    badge = '🔔';
  }
  
  const options = {
    body: data.body,
    icon: icon,
    badge: badge,
    tag: data.tag || 'chefstack-notification',
    requireInteraction: data.type === 'haccp_alert' || data.type === 'haccp_overdue',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      type: data.type
    },
    actions: [
      {
        action: 'view',
        title: 'Προβολή'
      },
      {
        action: 'dismiss',
        title: 'Απόκρυψη'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If a window is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(location.origin) && 'focus' in client) {
            return client.focus().then(client => {
              if (urlToOpen !== '/') {
                return client.navigate(urlToOpen);
              }
              return client;
            });
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-haccp-logs') {
    event.waitUntil(syncHaccpLogs());
  } else if (event.tag === 'sync-inventory') {
    event.waitUntil(syncInventory());
  }
});

// Sync functions
async function syncHaccpLogs() {
  // Retrieve pending logs from IndexedDB and sync to server
  console.log('[SW] Syncing HACCP logs...');
  // Implementation would retrieve from IndexedDB and POST to API
}

async function syncInventory() {
  // Retrieve pending inventory changes and sync to server
  console.log('[SW] Syncing inventory...');
  // Implementation would retrieve from IndexedDB and POST to API
}

// Periodic background sync (requires permission)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-haccp-reminders') {
    event.waitUntil(checkHaccpReminders());
  }
});

async function checkHaccpReminders() {
  console.log('[SW] Checking HACCP reminders...');
  // Implementation would check for overdue HACCP checks and show notifications
}
