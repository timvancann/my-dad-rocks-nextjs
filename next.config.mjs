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

export default nextConfig;
