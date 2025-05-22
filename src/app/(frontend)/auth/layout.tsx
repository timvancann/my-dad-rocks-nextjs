import { AuthProvider } from '@/providers/auth-provider';
import { THEME } from '@/themes';
import type { Metadata } from 'next';
import { Noto_Sans } from 'next/font/google';
import React from 'react';

const inter = Noto_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'My Dad Rocks - Sign In',
  description: 'Sign in to access My Dad Rocks'
};

export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  // No protected route wrapper for auth pages
  return <>{children}</>;
}