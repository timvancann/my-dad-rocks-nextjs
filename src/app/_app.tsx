import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { AppProps } from 'next/app';

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Handle offline navigation
    const handleRouteChange = (url: string) => {
      if (!navigator.onLine) {
        // Store the intended route for when we come back online
        localStorage.setItem('pendingRoute', url);
      }
    };

    // Handle coming back online
    const handleOnline = () => {
      const pendingRoute = localStorage.getItem('pendingRoute');
      if (pendingRoute) {
        localStorage.removeItem('pendingRoute');
        router.push(pendingRoute);
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);
    window.addEventListener('online', handleOnline);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [router]);

  return <Component {...pageProps} />;
}