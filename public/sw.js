const CACHE_NAME = 'fnb-training-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Background sync for offline submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(processOfflineQueue());
  }
});

async function processOfflineQueue() {
  const queuedSubmissions = JSON.parse(localStorage.getItem('queuedSubmissions') || '[]');
  
  for (const submission of queuedSubmissions) {
    try {
      // Process each queued submission
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission.data)
      });
    } catch (error) {
      console.error('Failed to sync submission:', error);
    }
  }
}