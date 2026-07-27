const CACHE_NAME = 'starbox-v1'

// Never cache these — always hit the network. Prevents stale prices, stock,
// cart contents, or order state from ever being served from cache.
const BYPASS_PREFIXES = ['/api/', '/cart', '/checkout']

function shouldBypass(pathname) {
  return BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function isStaticAsset(pathname) {
  return (
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/icons/') ||
    pathname === '/manifest.json' ||
    pathname === '/logo.png' ||
    /\.(?:png|jpg|jpeg|svg|webp|gif|ico|woff2?|ttf)$/.test(pathname)
  )
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  try {
    const response = await fetch(request)
    if (response && response.ok) cache.put(request, response.clone())
    return response
  } catch (err) {
    const cached = await cache.match(request)
    if (cached) return cached
    throw err
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response && response.ok) cache.put(request, response.clone())
  return response
}

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      ),
    ])
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return // never intercept writes

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return // leave cross-origin (fonts CDN, blob storage) alone
  if (shouldBypass(url.pathname)) return // API/cart/checkout — always network, never cached

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request))
    return
  }

  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request))
    return
  }

  event.respondWith(networkFirst(request))
})

self.addEventListener('push', (event) => {
  if (!event.data) return

  let data = {}
  try { data = event.data.json() } catch { data = { title: 'StarBox', body: event.data.text() } }

  const { title = 'StarBox', body = '', url = '/' } = data

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url },
      vibrate: [100, 50, 100],
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const existing = clientList.find((c) => c.url.includes(self.location.origin) && 'focus' in c)
      if (existing) return existing.focus().then(() => existing.navigate(url))
      return clients.openWindow(url)
    })
  )
})
