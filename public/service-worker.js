const CACHE_NAME = 'cal-voice-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/example.html',
  '/static/css/main.6bdbab6d.css',
  '/static/js/main.775447c1.js',
  '/Cal.png',
  '/Cal-192.png',
  '/manifest.json'
];

// Install service worker and cache assets
self.addEventListener('install', event => {
  console.log('Service Worker installing');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
  // Skip WebSocket connections
  if (event.request.url.startsWith('wss://')) {
    console.log('Skipping WebSocket request:', event.request.url);
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          console.log('Cache hit for:', event.request.url);
          return response;
        }

        console.log('Cache miss for:', event.request.url);
        // Clone the request because it's a stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's a stream
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                console.log('Caching new response for:', event.request.url);
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(error => {
          console.error('Fetch error:', error);
          throw error;
        });
      })
  );
});

// Clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating');
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle WebSocket messages
self.addEventListener('message', event => {
  console.log('Service Worker received message:', event.data);
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
