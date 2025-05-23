'use client';

import { THEME } from '@/themes';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AuthLoading() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/practice/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className={`flex flex-col items-center rounded-lg ${THEME.card} p-8 shadow-lg`}>
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-4 border-rosePine-highlightMed border-t-rosePine-love"></div>
          <p className="mt-4 text-rosePine-subtle">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
}