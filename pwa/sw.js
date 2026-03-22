const CACHE_NAME = 'qadaa-prayers-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './mosque-icon.svg',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap',
];

// Install — cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache first for local assets, network first for external
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET
  if (event.request.method !== 'GET') return;

  // Network first for Google Fonts (always fresh)
  if (url.hostname.includes('fonts.')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache first for everything else
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200) return response;
        const cloned = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
        return response;
      }).catch(() => {
        // Fallback to index.html for navigation
        if (event.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});

// Background Sync / Daily notification check
self.addEventListener('periodicsync', event => {
  if (event.tag === 'daily-reminder') {
    event.waitUntil(checkAndNotify());
  }
});

async function checkAndNotify() {
  // Read lastInteractionDate from IndexedDB or skip
  const hour = new Date().getHours();
  if (hour < 20) return; // only notify after 8 PM
  self.registration.showNotification('تذكير — قضاء الصلوات', {
    body: 'هل قمت بتسجيل صلواتك الفائتة اليوم؟',
    icon: './icon-192.png',
    badge: './icon-192.png',
    dir: 'rtl',
    lang: 'ar',
  });
}
