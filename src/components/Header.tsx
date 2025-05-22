'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { IoLogOutOutline, IoPersonCircleOutline } from 'react-icons/io5';
import { FcGoogle } from 'react-icons/fc';
import { getAuthProvider, getProviderDisplayName } from '@/lib/authUtils';
import { FaMicrosoft } from 'react-icons/fa';

interface HeaderProps {
  username?: string;
  onSignOut?: () => void;
}

export const Header = ({ username = 'Band Member', onSignOut }: HeaderProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);

  if (!session) {
    return null;

  }

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      // Default sign out behavior
      console.log('Sign out clicked');
      // You can implement your actual sign out logic here
    }
    setShowUserMenu(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md backdrop-filter">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left side - Band name */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold tracking-wider text-gray-100">
            My Dad <span className="text-red-600">Rocks</span>
          </h1>
        </div>

        {/* Right side - User info */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 transition-colors hover:bg-zinc-800"
          >
            <IoPersonCircleOutline className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-100">{session.user.name}</span>
          </button>

          {/* Dropdown menu */}
          {showUserMenu && (
            <>
              {/* Backdrop to close menu when clicking outside */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />

              {/* Dropdown content */}
              <div className="absolute right-0 top-full z-20 mt-2 min-w-60 rounded-lg border border-zinc-800 bg-zinc-900 shadow-lg">
                <div className="p-3">
                  <div className="mb-3 border-b border-zinc-800 pb-2">
                    <p className="text-sm text-gray-400">Signed in as</p>
                    <div className="flex items-center gap-2 mt-2">
                      {session.user.image &&
                        <Image src={session.user.image} alt="User Avatar" height={30} width={30}
                          className="rounded-full " />
                      }
                      <p className="text-sm font-medium text-amber-400">{session.user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <span>Signed in with</span>
                      {(() => {
                        const provider = getAuthProvider(session);
                        switch (provider) {
                          case 'google':
                            return (
                              <span className="flex items-center gap-1">
                                <FcGoogle className="h-4 w-4" />
                                {getProviderDisplayName(provider)}
                              </span>
                            );
                          case 'azure-ad':
                            return (
                              <span className="flex items-center gap-1">
                                <FaMicrosoft className="h-3 w-3 text-blue-500" />
                                {getProviderDisplayName(provider)}
                              </span>
                            );
                          default:
                            return <span>Unknown Provider</span>;
                        }
                      })()}
                    </div>
                  </div>

                  <button
                    onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-100 transition-colors hover:bg-zinc-800"
                  >
                    <IoLogOutOutline className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
