// ============================================================
// Apomuden Health Portal - Service Worker
// Production-grade PWA with Workbox caching strategies
// ============================================================

importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

// ============================================================
// 1. CONFIGURATION & CONSTANTS
// ============================================================

const CACHE_VERSION = 'v2';
const APP_SHELL_CACHE = `apomuden-shell-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `apomuden-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `apomuden-images-${CACHE_VERSION}`;
const FONT_CACHE = `apomuden-fonts-${CACHE_VERSION}`;
const API_CACHE = `apomuden-api-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// ============================================================
// 2. WORKBOX CONFIGURATION
// ============================================================

if (workbox) {
  console.log('[SW] Workbox loaded successfully');

  const { precaching, routing, strategies, expiration, cacheableResponse, backgroundSync } = workbox;

  // Skip waiting and claim clients immediately
  workbox.core.skipWaiting();
  workbox.core.clientsClaim();

  // ============================================================
  // 3. PRECACHING - App Shell Assets
  // ============================================================

  precaching.precacheAndRoute([
    { url: '/', revision: CACHE_VERSION },
    { url: '/offline.html', revision: CACHE_VERSION },
    { url: '/manifest.json', revision: CACHE_VERSION },
    { url: '/icons/icon-192x192.png', revision: null },
    { url: '/icons/icon-512x512.png', revision: null },
  ]);

  // ============================================================
  // 4. RUNTIME CACHING STRATEGIES
  // ============================================================

  // 4a. HTML Pages - Network First with offline fallback
  routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    new strategies.NetworkFirst({
      cacheName: APP_SHELL_CACHE,
      networkTimeoutSeconds: 3,
      plugins: [
        new cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
        new expiration.ExpirationPlugin({ 
          maxEntries: 50, 
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        })
      ]
    })
  );

  // 4b. Static Assets (JS, CSS) - Stale While Revalidate
  routing.registerRoute(
    ({ request }) => 
      request.destination === 'script' || 
      request.destination === 'style',
    new strategies.StaleWhileRevalidate({
      cacheName: APP_SHELL_CACHE,
      plugins: [
        new cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
        new expiration.ExpirationPlugin({ 
          maxEntries: 60, 
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        })
      ]
    })
  );

  // 4c. Images - Cache First with expiration
  routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new strategies.CacheFirst({
      cacheName: IMAGE_CACHE,
      plugins: [
        new cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
        new expiration.ExpirationPlugin({ 
          maxEntries: 100, 
          maxAgeSeconds: 60 * 24 * 60 * 60 // 60 days
        })
      ]
    })
  );

  // 4d. Fonts - Cache First, long expiry
  routing.registerRoute(
    ({ url }) => 
      url.origin === 'https://fonts.googleapis.com' || 
      url.origin === 'https://fonts.gstatic.com',
    new strategies.CacheFirst({
      cacheName: FONT_CACHE,
      plugins: [
        new cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
        new expiration.ExpirationPlugin({ 
          maxEntries: 30, 
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
        })
      ]
    })
  );

  // 4e. API GET Requests - Network First with cache fallback
  routing.registerRoute(
    ({ url, request }) => 
      url.pathname.startsWith('/api/') && 
      request.method === 'GET',
    new strategies.NetworkFirst({
      cacheName: API_CACHE,
      networkTimeoutSeconds: 5,
      plugins: [
        new cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
        new expiration.ExpirationPlugin({ 
          maxEntries: 50, 
          maxAgeSeconds: 5 * 60 // 5 minutes
        })
      ]
    })
  );

  // 4f. API POST Requests - Network Only with Background Sync
  const bgSyncPlugin = new backgroundSync.BackgroundSyncPlugin('apomuden-sync-queue', {
    maxRetentionTime: 24 * 60 // 24 hours in minutes
  });

  routing.registerRoute(
    ({ url, request }) => 
      url.pathname.startsWith('/api/') && 
      request.method === 'POST',
    new strategies.NetworkOnly({
      plugins: [bgSyncPlugin]
    }),
    'POST'
  );

  // ============================================================
  // 5. OFFLINE FALLBACK
  // ============================================================

  routing.setCatchHandler(async ({ event }) => {
    if (event.request.destination === 'document') {
      return caches.match(OFFLINE_URL);
    }
    return Response.error();
  });

} else {
  console.log('[SW] Workbox failed to load, using fallback');
}

// ============================================================
// 6. PUSH NOTIFICATIONS
// ============================================================

self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  let data = {
    title: 'Apomuden Health Alert',
    body: 'You have a new health notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    tag: 'apomuden-notification',
    data: { url: '/' },
    requireInteraction: false
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: data.data,
    vibrate: [200, 100, 200],
    renotify: true,
    requireInteraction: data.requireInteraction,
    actions: data.actions || [
      { action: 'view', title: 'View', icon: '/icons/icon-96x96.png' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  // Add image if provided
  if (data.image) {
    options.image = data.image;
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ============================================================
// 7. NOTIFICATION CLICK HANDLER
// ============================================================

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data?.url || event.notification.data?.deep_link || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// ============================================================
// 8. NOTIFICATION CLOSE HANDLER (Analytics)
// ============================================================

self.addEventListener('notificationclose', (event) => {
  const data = event.notification.data || {};
  console.log('[SW] Notification dismissed:', data.id || 'unknown');
  // Analytics tracking can be added here
});

// ============================================================
// 9. BACKGROUND SYNC
// ============================================================

self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  switch (event.tag) {
    case 'sync-emergency-request':
      event.waitUntil(syncEmergencyRequests());
      break;
    case 'sync-form-data':
      event.waitUntil(syncFormData());
      break;
    default:
      console.log('[SW] Unknown sync tag:', event.tag);
  }
});

async function syncEmergencyRequests() {
  console.log('[SW] Syncing emergency requests...');
  try {
    // Get pending requests from IndexedDB
    const db = await openDB();
    const requests = await getAllPendingRequests(db, 'emergency-requests');
    
    for (const request of requests) {
      try {
        const response = await fetch('/api/emergency', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request.data)
        });
        
        if (response.ok) {
          await deleteRequest(db, 'emergency-requests', request.id);
          console.log('[SW] Emergency request synced:', request.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync request:', request.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

async function syncFormData() {
  console.log('[SW] Syncing form data...');
  // Implementation for general form data sync
}

// IndexedDB helpers
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('apomuden-offline', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('emergency-requests')) {
        db.createObjectStore('emergency-requests', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getAllPendingRequests(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deleteRequest(db, storeName, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// ============================================================
// 10. MESSAGE HANDLER (from main thread)
// ============================================================

self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data?.type);

  switch (event.data?.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CLEAR_CACHE':
      caches.keys().then((keys) => 
        Promise.all(keys.map((key) => caches.delete(key)))
      ).then(() => {
        event.ports[0]?.postMessage({ success: true });
      });
      break;
    case 'GET_VERSION':
      event.ports[0]?.postMessage({ version: CACHE_VERSION });
      break;
    default:
      console.log('[SW] Unknown message type:', event.data?.type);
  }
});

// ============================================================
// 11. PERIODIC BACKGROUND SYNC (for data refresh)
// ============================================================

self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);

  if (event.tag === 'refresh-health-alerts') {
    event.waitUntil(refreshHealthAlerts());
  }
});

async function refreshHealthAlerts() {
  try {
    const response = await fetch('/api/alerts?limit=10');
    if (response.ok) {
      const alerts = await response.json();
      // Cache the latest alerts
      const cache = await caches.open(API_CACHE);
      await cache.put('/api/alerts?limit=10', response.clone());
      console.log('[SW] Health alerts refreshed');
    }
  } catch (error) {
    console.error('[SW] Failed to refresh alerts:', error);
  }
}

console.log('[SW] Apomuden Service Worker loaded - Version:', CACHE_VERSION);
