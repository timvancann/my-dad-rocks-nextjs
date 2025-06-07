import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development' ? false : false, // Always enabled
  sw: '/sw.js',
  scope: '/',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/, // Match all requests
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    }
  ],
  buildExcludes: [/middleware-manifest\.json$/],
  publicExcludes: ['!robots.txt', '!sitemap*.xml'],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com", "coverartarchive.org", "owjfnhmdikxkltvrizzj.supabase.co"]
  },

};

export default withPWA(nextConfig);
