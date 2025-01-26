import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import React from 'react';
import { Footer } from '@/components/Footer';
import PracticeProvider from '@/context/PracticeProvider';
import { getAllSongs, getSetlist } from '@/lib/sanity';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'My Dad Rocks',
  description: 'The most awesome dad rock in the world!'
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {

  const setlist = await getSetlist('Practice')
  const allSongs = await getAllSongs()


  return (
    <html lang="en">
      <head>
        <title>My Dad Rocks</title>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </head>
      <body suppressHydrationWarning={true} className={`${inter.className} text-rosePine-text h-screen flex-col bg-rosePine-base justify-between`}>
        <div className={'pb-16'}>
          <PracticeProvider setlist={setlist} allSongs={allSongs}>
            {children}
          </PracticeProvider>
          <Footer />
        </div>
      </body>
    </html>
  );
}
