'use client';

import { THEME } from '@/themes';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log(status)
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);
  
  // Don't protect auth pages
  const isAuthPage = pathname?.startsWith('/auth');
  if (isAuthPage) {
    return <>{children}</>;
  }


  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className={`flex flex-col items-center rounded-lg ${THEME.card} p-8 shadow-lg`}>
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-4 border-rosePine-highlightMed border-t-rosePine-love"></div>
          <p className="mt-4 text-rosePine-subtle">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return <>{children}</>;
  }

  // This return is just for typescript, the component will redirect before rendering
  return null;
}
