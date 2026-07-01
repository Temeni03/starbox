self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()))

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
