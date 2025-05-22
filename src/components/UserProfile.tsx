'use client';

import { Button } from '@/components/ui/button';
import { THEME } from '@/themes';
import { LogOut, User } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

export function UserProfile() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (!session) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-full ${THEME.card} p-2 shadow-md hover:opacity-90`}
      >
        <span className="text-sm hidden sm:inline">
          {session.user?.name || session.user?.email?.split('@')[0]}
        </span>
        <User className="h-5 w-5" />
      </button>

      {isOpen && (
        <div
          className={`right-0 mt-2 w-48 rounded-md shadow-lg ${THEME.card} ring-1 ring-black ring-opacity-5 focus:outline-none`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu"
        >
          <div className="py-1" role="none">
            <div className={`px-4 py-2 text-sm ${THEME.textSecondary} border-b ${THEME.border}`}>
              <p className="font-medium">{session.user?.name}</p>
              <p className="text-xs truncate">{session.user?.email}</p>
            </div>
            <Button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="flex w-full items-center justify-between px-4 py-2 text-sm text-rosePine-love hover:bg-rosePine-surface"
              variant="ghost"
            >
              Sign out
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
