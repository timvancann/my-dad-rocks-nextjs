import { Footer } from '@/components/Footer';
import PracticeProvider from '@/context/PracticeProvider';
import { getAllSongs, getSetlist } from '@/actions/supabase';
import { AuthProvider } from '@/providers/auth-provider';
import { TanstackProvider } from '@/providers/tanstack-provider';
import { THEME } from '@/themes';
import type { Metadata } from 'next';
import { Noto_Sans } from 'next/font/google';
import React from 'react';
import '../../globals.css';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { NetworkStatus } from '@/components/NetworkStatus';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import { OfflineDataInitializer } from '@/components/OfflineDataInitializer';

const inter = Noto_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'My Dad Rocks',
  description: 'The most awesome dad rock in the world!'
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const setlist = await getSetlist('Practice');
  const allSongs = await getAllSongs();

  return (
    <html lang="en">
      <head>
        <title>My Dad Rocks</title>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body suppressHydrationWarning={true} className={`${inter.className} h-screen ${THEME.bg} ${THEME.text}`}>
        <AuthProvider>
          <TanstackProvider>
            <ProtectedRoute>
              <ServiceWorkerRegistration />
              <NetworkStatus />
              <OfflineDataInitializer>
                <div className={'flex flex-col'}>
                  <PracticeProvider setlist={setlist} allSongs={allSongs}>
                    <Header />
                    <main className="mb-40 px-3 pt-4">{children}</main>
                    <Footer />
                  </PracticeProvider>
                </div>
              </OfflineDataInitializer>
            </ProtectedRoute>
          </TanstackProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
