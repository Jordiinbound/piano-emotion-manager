/**
 * Service Worker para Caché de Segundo Nivel
 * Estrategia: Network First con fallback a Cache
 */

const CACHE_NAME = 'piano-emotion-cache-v1';
const API_CACHE_NAME = 'piano-emotion-api-cache-v1';

// Rutas a cachear
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Rutas de API a cachear (tRPC)
const API_ROUTES = [
  '/api/trpc/',
];

/**
 * Instalación del Service Worker
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  // Activar inmediatamente sin esperar
  self.skipWaiting();
});

/**
 * Activación del Service Worker
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Eliminar cachés antiguos
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Tomar control inmediatamente
  return self.clients.claim();
});

/**
 * Interceptar peticiones
 * Estrategia: Network First con fallback a Cache
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo cachear peticiones GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Determinar si es una petición de API
  const isAPIRequest = API_ROUTES.some(route => url.pathname.startsWith(route));
  const cacheName = isAPIRequest ? API_CACHE_NAME : CACHE_NAME;
  
  // Estrategia: Network First con fallback a Cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Si la respuesta es válida, cachearla
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          
          caches.open(cacheName).then((cache) => {
            // Para API, solo cachear si no hay errores
            if (isAPIRequest) {
              // Verificar que no sea un error de tRPC
              responseToCache.clone().json().then((data) => {
                if (!data.error) {
                  cache.put(request, responseToCache);
                  console.log('[SW] Cached API response:', url.pathname);
                }
              }).catch(() => {
                // Si no es JSON válido, no cachear
              });
            } else {
              // Cachear assets estáticos directamente
              cache.put(request, responseToCache);
              console.log('[SW] Cached static asset:', url.pathname);
            }
          });
        }
        
        return response;
      })
      .catch(() => {
        // Si falla la red, intentar obtener de caché
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[SW] Serving from cache:', url.pathname);
            return cachedResponse;
          }
          
          // Si no hay caché, retornar error
          return new Response('Network error', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
          });
        });
      })
  );
});

/**
 * Mensaje para limpiar caché
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[SW] Clearing cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
