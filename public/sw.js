// Versión del Service Worker - INCREMENTAR cuando haya cambios
const SW_VERSION = '2.0.0';
const CACHE_NAME = `conferente-v${SW_VERSION}`;
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-192-maskable.png',
  '/icon-512-maskable.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log(`[Service Worker v${SW_VERSION}] Installing...`);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.log('[Service Worker] Some assets could not be cached:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches y notificar actualización
self.addEventListener('activate', (event) => {
  console.log(`[Service Worker v${SW_VERSION}] Activating...`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      // Notificar a los clientes sobre la actualización
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: SW_VERSION,
            message: 'Nueva versión disponible. Actualiza la app para obtener las últimas mejoras.'
          });
        });
      });
    })
  );
  self.clients.claim();
});

// Fetch event - network first, then cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external APIs (Google Gemini API, fonts, etc.)
  if (url.origin !== location.origin) {
    return;
  }

  // Network-first strategy for HTML
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Verificar si hay nueva versión
          const cachedResponse = caches.match(request);
          if (cachedResponse) {
            // Comparar versiones si es posible
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Cache-first strategy for other assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Verificar si hay actualización en background
        fetch(request).then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
        }).catch(() => {
          // Ignorar errores de red
        });
        return cached;
      }
      
      return fetch(request).then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

// Message handler para comunicación con la app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    // Verificar actualizaciones manualmente
    self.registration.update().then(() => {
      console.log('[Service Worker] Update check completed');
    });
  }
});
