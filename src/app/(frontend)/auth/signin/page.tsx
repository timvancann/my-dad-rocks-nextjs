'use client';

import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

export default function SignIn() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-100">
            My Dad <span className="text-red-600">Rocks</span>
          </h1>
          <p className="mt-2 text-gray-400">Sign in to access band materials</p>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => signIn('google', { callbackUrl: '/' })} 
            className="flex w-full items-center justify-center gap-2 bg-white py-2 text-gray-800 hover:bg-gray-100"
          >
            <Image src="/google-icon.svg" alt="Google Logo" width={20} height={20} />
            <span>Sign in with Google</span>
          </Button>
          
          <Button 
            onClick={() => signIn('azure-ad', { callbackUrl: '/' })} 
            className="flex w-full items-center justify-center gap-2 bg-white py-2 text-gray-800 hover:bg-gray-100"
          >
            <Image src="/microsoft-icon.svg" alt="Microsoft Logo" width={20} height={20} />
            <span>Sign in with Outlook</span>
          </Button>
        </div>

        <p className="mt-4 text-center text-sm text-gray-400">
          Only band members with authorized email addresses can access this site.
        </p>
      </div>
    </div>
  );
} 