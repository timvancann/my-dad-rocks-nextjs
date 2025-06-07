'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      // Check if we're on localhost or HTTPS (required for service workers)
      const isLocalhost = Boolean(
        window.location.hostname === 'localhost' ||
        window.location.hostname === '[::1]' ||
        window.location.hostname.match(
          /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
        )
      );

      // Always allow HTTPS and localhost
      if (!isLocalhost && window.location.protocol !== 'https:') {
        console.warn('Service workers require HTTPS or localhost');
        return;
      }

      console.log('Environment check passed, attempting to register service worker');
      console.log('Current location:', window.location.href);

      try {
        // First, try to fetch the service worker file to see if it exists
        fetch('/sw.js')
          .then(response => {
            console.log('Service worker file fetch response:', response.status, response.statusText);
            if (response.ok) {
              console.log('Service worker file exists, proceeding with registration');
            } else {
              console.error('Service worker file not found:', response.status);
            }
          })
          .catch(error => {
            console.error('Error fetching service worker file:', error);
          });

        // Register the service worker using native browser API instead of Workbox
        navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        }).then((registration) => {
          console.log('Service worker registered successfully:', registration);
          
          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              console.log('New service worker installing...');
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New service worker installed, prompting for update');
                  if (confirm('New app update is available! Click OK to refresh.')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
          
          // Force update and activation if there's a waiting worker
          if (registration.waiting) {
            console.log('Service worker waiting, activating...');
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }).catch((error) => {
          console.error('Service worker registration failed:', error);
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          });
        });
      } catch (error) {
        console.error('Error setting up service worker:', error);
      }
    }
  }, []);

  return null;
}