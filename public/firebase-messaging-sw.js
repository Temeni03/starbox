// Handles FCM push notifications while the app is closed or in the background.
// Runs as a classic (non-module) service worker, so config can't come from
// process.env here — these values are the public Firebase web config (safe to
// expose; not secrets) and must be kept in sync with .env.local's NEXT_PUBLIC_FIREBASE_* vars.
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyB8R304chJ_cO8yZHztx-JngKskYBq60qc',
  authDomain: 'starbox-e3336.firebaseapp.com',
  projectId: 'starbox-e3336',
  storageBucket: 'starbox-e3336.firebasestorage.app',
  messagingSenderId: '915819029923',
  appId: '1:915819029923:web:7d70aecf91a7db085a6616',
})

const messaging = firebase.messaging()

// Server sends data-only messages (see src/lib/push.ts) so we control the
// notification's shape here, matching the UX of the old web-push service worker.
messaging.onBackgroundMessage((payload) => {
  const { title = 'StarBox', body = '', url = '/' } = payload.data || {}

  self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url },
    vibrate: [100, 50, 100],
  })
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
