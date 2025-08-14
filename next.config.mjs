import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development
  runtimeCaching: [
    // API routes - Network first for fresh data, fall back to cache offline
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-api',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24, // 1 day for API data
        },
        cacheableResponse: {
          statuses: [0, 200]
        },
        networkTimeoutSeconds: 5 // Try network for 5 seconds before falling back to cache
      }
    },
    // Lyrics pages - Cache first for offline reading
    {
      urlPattern: /^https?.*\/practice\/lyrics\/.*$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'lyrics-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days for lyrics
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },
    // Audio files - Cache first for offline listening
    {
      urlPattern: /\.(?:mp3|wav|ogg|m4a|aac|flac)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'audio-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },
    // Images - Cache first for faster loading
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },
    // Static assets - Cache first for performance
    {
      urlPattern: /^https?.*\/_next\/static\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        }
      }
    },
    // Song detail pages - Cache first for offline access
    {
      urlPattern: /^https?.*\/practice\/song\/.*$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'song-pages',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },
    // Other app routes - NetworkFirst for freshness but offline fallback
    {
      urlPattern: /^https?.*\/practice\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'app-pages',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },
    // Everything else - NetworkFirst with fallback
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'general-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 12, // 12 hours
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    }
  ],
  buildExcludes: [/middleware-manifest\.json$/],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'coverartarchive.org',
      },
      {
        protocol: 'https',
        hostname: 'owjfnhmdikxkltvrizzj.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
    ],
  }
};

export default withPWA(nextConfig);
