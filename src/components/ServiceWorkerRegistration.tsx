'use client';

import { useEffect } from 'react';
import { Workbox } from 'workbox-window';

async function cacheAllSongsAndLyrics() {
  try {
    console.log('Starting background cache of all songs and lyrics...');
    
    // Fetch all songs from the API
    const response = await fetch('/api/songs');
    if (!response.ok) {
      console.warn('Failed to fetch songs list for background caching');
      return;
    }
    
    const songs = await response.json();
    console.log(`Found ${songs.length} songs to cache`);
    
    // Cache each song's lyrics and detail page in the background
    const cachePromises = songs.map(async (song: any) => {
      try {
        // Cache lyrics page
        if (song.slug) {
          await fetch(`/practice/lyrics/${song.slug}`);
          console.log(`Cached lyrics for: ${song.title}`);
        }
        
        // Cache song detail page
        if (song.slug) {
          await fetch(`/practice/song/${song.slug}`);
          console.log(`Cached song page for: ${song.title}`);
        }
        
        // Cache album art if available
        if (song.album_art_url) {
          await fetch(song.album_art_url);
        }
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`Failed to cache song ${song.title}:`, error);
      }
    });
    
    // Process in batches of 5 to avoid overwhelming the browser/server
    const batchSize = 5;
    for (let i = 0; i < cachePromises.length; i += batchSize) {
      const batch = cachePromises.slice(i, i + batchSize);
      await Promise.all(batch);
      console.log(`Completed caching batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(cachePromises.length / batchSize)}`);
    }
    
    console.log('Background caching of all songs and lyrics completed!');
  } catch (error) {
    console.error('Error during background caching:', error);
  }
}

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
          
          // Background cache all songs and lyrics after installation
          if (event.isUpdate) {
            console.log('Service worker updated, skipping background cache');
          } else {
            console.log('First install, starting background cache of songs and lyrics');
            cacheAllSongsAndLyrics();
          }
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