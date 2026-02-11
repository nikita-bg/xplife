const CACHE_NAME = 'xplife-v3'
const OFFLINE_URL = '/offline.html'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  // Navigation requests — network first, offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    )
    return
  }

  // Other requests — network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && event.request.url.startsWith(self.location.origin)) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => caches.match(event.request))
  )
})

// Periodic Background Sync — refresh cached data when browser allows
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'xplife-sync') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) =>
        cache.add('/dashboard').catch(() => {})
      )
    )
  }
})

// Background Sync — retry failed requests when back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'xplife-background-sync') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) =>
        cache.add('/dashboard').catch(() => {})
      )
    )
  }
})

// Push Notifications — handle incoming push messages
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'XPLife'
  const options = {
    body: data.body || 'You have a new quest!',
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    data: { url: data.url || '/dashboard' },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/dashboard'
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) return client.focus()
      }
      return clients.openWindow(url)
    })
  )
})
