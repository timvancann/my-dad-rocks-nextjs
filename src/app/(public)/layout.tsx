// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'My Dad Rocks - Classic Rock Band',
  description: 'The most awesome dad rock in the world! Classic rock band from Rotterdam, Netherlands.',
  keywords: 'rock band, classic rock, live music, Rotterdam, Netherlands, dad rock',
  openGraph: {
    title: 'My Dad Rocks - Classic Rock Band',
    description: 'The most awesome dad rock in the world!',
    type: 'website',
  }
};

export default function PublicLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>My Dad Rocks - Classic Rock Band</title>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} bg-zinc-950 text-gray-100`}>
        {children}
      </body>
    </html>
  );
}
