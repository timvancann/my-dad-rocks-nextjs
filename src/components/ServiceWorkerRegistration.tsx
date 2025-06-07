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

      // Listen for global service worker errors
      navigator.serviceWorker.addEventListener('error', (error) => {
        console.error('Global service worker error:', error);
      });

      try {
        // First, try to fetch the service worker file to see if it exists
        fetch('/sw.js')
          .then(response => {
            console.log('Service worker file fetch response:', response.status, response.statusText);
            if (response.ok) {
              console.log('Service worker file exists, proceeding with registration');
              
              // Also check if workbox file exists by parsing the SW content
              return response.text();
            } else {
              console.error('Service worker file not found:', response.status);
              return null;
            }
          })
          .then(swContent => {
            if (swContent) {
              // Extract workbox file name from service worker content
              const workboxMatch = swContent.match(/workbox-[a-f0-9]+\.js/);
              if (workboxMatch) {
                const workboxFile = workboxMatch[0];
                console.log('Found workbox reference:', workboxFile);
                
                // Check if workbox file exists
                fetch(`/${workboxFile}`)
                  .then(response => {
                    console.log(`Workbox file ${workboxFile} fetch response:`, response.status, response.statusText);
                    if (!response.ok) {
                      console.error(`Workbox file ${workboxFile} not found:`, response.status);
                    }
                  })
                  .catch(error => {
                    console.error(`Error fetching workbox file ${workboxFile}:`, error);
                  });
              }
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
          
          // Check if there's an immediately installing worker
          if (registration.installing) {
            console.log('Service worker is installing immediately...');
            registration.installing.addEventListener('statechange', () => {
              console.log('Initial SW state changed to:', registration.installing?.state);
              if (registration.installing?.state === 'activated') {
                console.log('Initial service worker activated successfully');
              }
            });
            
            registration.installing.addEventListener('error', (error) => {
              console.error('Initial service worker installation error:', error);
            });
          }
          
          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              console.log('New service worker installing...');
              newWorker.addEventListener('statechange', () => {
                console.log('Service worker state changed to:', newWorker.state);
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New service worker installed, prompting for update');
                  if (confirm('New app update is available! Click OK to refresh.')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                } else if (newWorker.state === 'activated') {
                  console.log('Service worker activated successfully');
                }
              });
              
              newWorker.addEventListener('error', (error) => {
                console.error('Service worker installation error:', error);
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