'use client';

import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  let errorMessage = 'An error occurred during sign in.';
  let errorTitle = 'Authentication Error';

  if (error === 'AccessDenied') {
    errorTitle = 'Access Denied';
    errorMessage = 'Your email is not authorized to access this site. Only band members can sign in.';
  } else if (error === 'OAuthSignin') {
    errorMessage = 'Error starting the sign-in process. Please try again.';
  } else if (error === 'OAuthCallback') {
    errorMessage = 'Error during the sign-in callback. Please try again.';
  } else if (error === 'SessionRequired') {
    errorMessage = 'You need to be signed in to access this page.';
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md rounded-lg border border-red-600 bg-zinc-900 p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-red-600">{errorTitle}</h1>
          <p className="mt-2 text-gray-400">{errorMessage}</p>
        </div>

        <Button 
          onClick={() => signIn('google')} 
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          Try with a different account
        </Button>
      </div>
    </div>
  );
}