// ══════════════════════════════════════════
// قضاء الصلوات — Service Worker v6
// Offline-first + Daily 2PM Notification
// ══════════════════════════════════════════
const CACHE_NAME = 'qadaa-prayers-v6';
const DATA_KEY   = 'prayer_tracker_v3';   // ← same key used by the app

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
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      await cache.addAll(APP_SHELL);
      await Promise.allSettled(
        EXTERNAL.map(url =>
          fetch(url, { mode: 'cors', credentials: 'omit' })
            .then(res => { if (res.ok) cache.put(url, res); })
            .catch(() => {})
        )
      );
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE ───────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
    // ⚠ Do NOT send SW_UPDATED to force reload — it caused perceived data loss.
    // The app will silently load the new cached version on next navigation.
  );
});

// ── FETCH — Cache First for own origin, Network First for others ──
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

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
    // Background revalidate
    fetch(request).then(res => { if (res && res.status === 200) cache.put(request, res.clone()); }).catch(() => {});
    return cached;
  }
  try {
    const res = await fetch(request);
    if (res && res.status === 200) cache.put(request, res.clone());
    return res;
  } catch {
    if (request.mode === 'navigate') {
      const idx = await cache.match('./index.html');
      if (idx) return idx;
    }
    return new Response('غير متاح بدون اتصال', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
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
    return cached || new Response('غير متاح', { status: 503 });
  }
}

// ══════════════════════════════════════════
//  DAILY 2 PM NOTIFICATION
//  Works fully offline — logic lives here
//  in the SW, independent of the page.
// ══════════════════════════════════════════

// Called by the page when user grants notification permission.
// We store the target hour in SW globalThis so restarts re-schedule.
let _notifyTimer = null;

function msUntilNext2PM() {
  const now  = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);   // already past → tomorrow
  return next - now;
}

function scheduleDaily2PM() {
  if (_notifyTimer) clearTimeout(_notifyTimer);

  const delay = msUntilNext2PM();

  _notifyTimer = setTimeout(async () => {
    // Check if user interacted today — read from IDB/clients
    const shouldNotify = await checkShouldNotify();
    if (shouldNotify) {
      await self.registration.showNotification('🕌 تذكير — قضاء الصلوات', {
        body: 'لا تنسَ تسجيل وقضاء صلواتك الفائتة اليوم',
        icon: './mosque-icon.svg',
        badge: './mosque-icon.svg',
        dir: 'rtl', lang: 'ar',
        tag: 'daily-prayer-2pm',     // replaces previous same-tag notification
        renotify: false,
        vibrate: [200, 100, 200],
        actions: [{ action: 'open', title: 'فتح التطبيق' }],
      });
    }
    // Schedule next day automatically
    scheduleDaily2PM();
  }, delay);
}

// Read lastInteractionDate from all open clients via postMessage.
// Falls back to "should notify" if we can't reach any client (background).
async function checkShouldNotify() {
  const todayStr = new Date().toISOString().split('T')[0];
  try {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (allClients.length === 0) {
      // No open window — assume notification is needed (background scenario)
      return true;
    }
    // Ask the first client for its lastInteractionDate
    return new Promise(resolve => {
      const ch = new MessageChannel();
      ch.port1.onmessage = e => {
        const interactionDate = e.data && e.data.lastInteractionDate;
        resolve(interactionDate !== todayStr);
      };
      allClients[0].postMessage({ type: 'GET_INTERACTION_DATE' }, [ch.port2]);
      // Timeout after 500ms → assume notify
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
    case 'SCHEDULE_DAILY_NOTIFY':
      // Page sends this when notification permission is granted
      scheduleDaily2PM();
      break;
    case 'CANCEL_DAILY_NOTIFY':
      if (_notifyTimer) { clearTimeout(_notifyTimer); _notifyTimer = null; }
      break;
    case 'PING':
      // Keepalive from page (sent every 20s while page is open)
      // Re-schedule if timer was lost (e.g. SW restarted)
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

// ── PUSH (server-sent, optional) ────────────
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
