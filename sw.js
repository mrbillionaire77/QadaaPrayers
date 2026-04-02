// ══════════════════════════════════════════
// قضاء الصلوات — Service Worker v7
// Offline-first + Daily 2PM Notification
// ══════════════════════════════════════════
const CACHE_NAME = 'qadaa-prayers-v7';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './mosque-icon.svg',
];

const EXTERNAL = [
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap',
];

// ── INSTALL ────────────────────────────────
// ⚠ لا نستدعي skipWaiting() هنا — نتركها للمستخدم عبر الـ banner
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      // Cache each item individually to avoid one failure stopping the rest
      await Promise.allSettled(
        APP_SHELL.map(url => cache.add(url).catch(() => {}))
      );
      await Promise.allSettled(
        EXTERNAL.map(url =>
          fetch(url, { mode: 'cors', credentials: 'omit' })
            .then(res => { if (res && res.ok) cache.put(url, res); })
            .catch(() => {})
        )
      );
    })
  );
  // لا نستدعي skipWaiting هنا — السيطرة تمر عند ضغط المستخدم على "تحديث"
});

// ── ACTIVATE ───────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(async () => {
        // أخبر جميع الصفحات المفتوحة بأن الـ SW الجديد فعّال
        const clients = await self.clients.matchAll({ type: 'window' });
        clients.forEach(c => c.postMessage({ type: 'SW_ACTIVATED' }));
      })
  );
});

// ── FETCH — Network-first for HTML, Cache-first for rest ──
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // للصفحة الرئيسية: network-first حتى يحصل على أحدث نسخة
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // للخطوط وملفات التطبيق: cache-first مع revalidate في الخلفية
  if (url.origin === self.location.origin || url.hostname.includes('fonts.')) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});

async function cacheFirst(request) {
  const cache  = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) {
    // Stale-while-revalidate: أرجع المخزن فوراً وحدّث في الخلفية
    fetch(request)
      .then(res => { if (res && res.status === 200) cache.put(request, res.clone()); })
      .catch(() => {});
    return cached;
  }
  try {
    const res = await fetch(request);
    if (res && res.status === 200) cache.put(request, res.clone());
    return res;
  } catch {
    return new Response('غير متاح بدون اتصال', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const res = await fetch(request);
    if (res && res.status === 200) cache.put(request, res.clone());
    return res;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    // fallback to index for navigation
    if (request.mode === 'navigate') {
      const idx = await cache.match('./index.html');
      if (idx) return idx;
    }
    return new Response('غير متاح', { status: 503 });
  }
}

// ══════════════════════════════════════════
//  DAILY 2 PM NOTIFICATION
// ══════════════════════════════════════════
let _notifyTimer = null;

function msUntilNext2PM() {
  const now  = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next - now;
}

function scheduleDaily2PM() {
  if (_notifyTimer) clearTimeout(_notifyTimer);
  const delay = msUntilNext2PM();
  _notifyTimer = setTimeout(async () => {
    const should = await checkShouldNotify();
    if (should) {
      await self.registration.showNotification('🕌 تذكير — قضاء الصلوات', {
        body: 'لا تنسَ تسجيل وقضاء صلواتك الفائتة اليوم',
        icon: './mosque-icon.svg',
        badge: './mosque-icon.svg',
        dir: 'rtl', lang: 'ar',
        tag: 'daily-prayer-2pm',
        renotify: false,
        vibrate: [200, 100, 200],
        actions: [{ action: 'open', title: 'فتح التطبيق' }],
      });
    }
    scheduleDaily2PM(); // schedule next day
  }, delay);
}

async function checkShouldNotify() {
  const todayStr = new Date().toISOString().split('T')[0];
  try {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (allClients.length === 0) return true;
    return new Promise(resolve => {
      const ch = new MessageChannel();
      ch.port1.onmessage = e => {
        resolve((e.data && e.data.lastInteractionDate) !== todayStr);
      };
      allClients[0].postMessage({ type: 'GET_INTERACTION_DATE' }, [ch.port2]);
      setTimeout(() => resolve(true), 500);
    });
  } catch {
    return true;
  }
}

// ── MESSAGES FROM PAGE ──────────────────────
self.addEventListener('message', event => {
  const { data } = event;
  if (!data) return;

  switch (data.type) {
    case 'SKIP_WAITING':
      // المستخدم ضغط "تحديث" في الـ banner — تولَّ الآن
      self.skipWaiting();
      break;
    case 'SCHEDULE_DAILY_NOTIFY':
      scheduleDaily2PM();
      break;
    case 'CANCEL_DAILY_NOTIFY':
      if (_notifyTimer) { clearTimeout(_notifyTimer); _notifyTimer = null; }
      break;
    case 'PING':
      if (data.notifyEnabled && !_notifyTimer) scheduleDaily2PM();
      break;
  }
});

// ── PERIODIC BACKGROUND SYNC (Chrome Android) ──
self.addEventListener('periodicsync', event => {
  if (event.tag === 'daily-prayer-2pm') {
    event.waitUntil(
      checkShouldNotify().then(should => {
        if (!should) return;
        return self.registration.showNotification('🕌 تذكير — قضاء الصلوات', {
          body: 'لا تنسَ تسجيل وقضاء صلواتك الفائتة اليوم',
          icon: './mosque-icon.svg',
          dir: 'rtl', lang: 'ar',
          tag: 'daily-prayer-2pm',
          vibrate: [200, 100, 200],
        });
      })
    );
  }
});

// ── PUSH ────────────────────────────────────
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || '🕌 قضاء الصلوات', {
      body: data.body || 'تذكير بتسجيل صلواتك الفائتة',
      icon: './mosque-icon.svg',
      dir: 'rtl', lang: 'ar',
      vibrate: [200, 100, 200],
    })
  );
});

// ── NOTIFICATION CLICK ──────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length > 0) return list[0].focus();
      return self.clients.openWindow('./');
    })
  );
});
