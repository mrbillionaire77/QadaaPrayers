// ══════════════════════════════════════════
// قضاء الصلوات — Service Worker v3
// Offline-first: cache everything on install
// ══════════════════════════════════════════
const CACHE_NAME = 'qadaa-prayers-v3';

// All assets to cache on install (app shell)
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './mosque-icon.svg',
];

// External assets to attempt caching (non-fatal if fail)
const EXTERNAL = [
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap',
  'https://fonts.gstatic.com/s/tajawal/v9/Iura6YBj_oCad4k1l5qjHrRpiYlJ.woff2',
  'https://fonts.gstatic.com/s/tajawal/v9/Iura6YBj_oCad4k1nZqjHrRpiYlJ.woff2',
];

// ── INSTALL ────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      // Cache app shell (must succeed)
      await cache.addAll(APP_SHELL);
      // Cache external fonts (best-effort)
      await Promise.allSettled(
        EXTERNAL.map(url =>
          fetch(url, { mode: 'cors', credentials: 'omit' })
            .then(res => { if (res.ok) cache.put(url, res); })
            .catch(() => {})
        )
      );
    })
  );
  // Activate immediately without waiting for old SW to finish
  self.skipWaiting();
});

// ── ACTIVATE ───────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    )
  );
  // Take control of all open clients immediately
  self.clients.claim();
});

// ── FETCH ──────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and non-http
  if (!url.protocol.startsWith('http')) return;

  // ── Strategy: Cache First (with network update) for app shell
  if (url.origin === self.location.origin || url.hostname.includes('fonts.')) {
    event.respondWith(cacheFirstWithUpdate(request));
    return;
  }

  // ── Default: Network First with cache fallback
  event.respondWith(networkFirstWithCache(request));
});

// Cache First: return cached, update cache in background
async function cacheFirstWithUpdate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  // Fetch in background to keep cache fresh
  const fetchPromise = fetch(request)
    .then(response => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  // Return cached immediately, or wait for network
  if (cached) return cached;

  const networkResponse = await fetchPromise;
  if (networkResponse) return networkResponse;

  // Ultimate fallback: serve index.html for navigation
  if (request.mode === 'navigate') {
    const indexCache = await cache.match('./index.html');
    if (indexCache) return indexCache;
  }

  return new Response('غير متاح بدون اتصال', {
    status: 503,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

// Network First: try network, fall back to cache
async function networkFirstWithCache(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response('غير متاح', { status: 503 });
  }
}

// ── PUSH NOTIFICATIONS ─────────────────────
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'قضاء الصلوات', {
      body: data.body || 'هل قمت بتسجيل صلواتك الفائتة اليوم؟',
      icon: './mosque-icon.svg',
      badge: './mosque-icon.svg',
      dir: 'rtl', lang: 'ar',
      vibrate: [200, 100, 200],
    })
  );
});

// ── NOTIFICATION CLICK ─────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) return clientList[0].focus();
      return clients.openWindow('./');
    })
  );
});

// ── PERIODIC BACKGROUND SYNC ───────────────
self.addEventListener('periodicsync', event => {
  if (event.tag === 'daily-prayer-reminder') {
    event.waitUntil(showDailyReminder());
  }
});

async function showDailyReminder() {
  const hour = new Date().getHours();
  if (hour < 20) return; // Only after 8 PM
  await self.registration.showNotification('تذكير يومي — قضاء الصلوات', {
    body: 'لا تنسَ تسجيل صلواتك الفائتة اليوم',
    icon: './mosque-icon.svg',
    dir: 'rtl', lang: 'ar',
    vibrate: [100, 50, 100],
  });
}
