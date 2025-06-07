// Simple test service worker
console.log('Test service worker loaded');

self.addEventListener('install', (event) => {
  console.log('Test service worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Test service worker activated');
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Just pass through all requests for now
  event.respondWith(fetch(event.request));
});