'use client';

import { useEffect } from 'react';
import { Workbox } from 'workbox-window';

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

      if (!isLocalhost && window.location.protocol !== 'https:') {
        console.warn('Service workers require HTTPS or localhost');
        return;
      }

      try {
        // Create workbox instance manually since next-pwa doesn't do this automatically
        const wb = new Workbox('/sw.js');

        // Add event listeners to handle PWA lifecycle events
        wb.addEventListener('installed', (event) => {
          console.log('Service worker installed:', event);
        });

        wb.addEventListener('controlling', (event) => {
          console.log('Service worker controlling:', event);
          window.location.reload();
        });

        wb.addEventListener('waiting', (event) => {
          console.log('Service worker waiting:', event);
          // You could show a prompt to reload for updates here
          if (confirm('New app update is available! Click OK to refresh.')) {
            wb.addEventListener('controlling', () => {
              window.location.reload();
            });
            wb.messageSkipWaiting();
          }
        });

        // Register the service worker
        wb.register().then((registration) => {
          console.log('Service worker registered successfully:', registration);
          
          // Force update and activation
          if (registration?.waiting) {
            console.log('Service worker waiting, activating...');
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }).catch((error) => {
          console.error('Service worker registration failed:', error);
        });
      } catch (error) {
        console.error('Error setting up service worker:', error);
      }
    }
  }, []);

  return null;
}