import React from 'react';
import { AddGig } from '@/components/AddGig';

export default function Home() {
  return (
    <div className="md:flex md:flex-col items-center justify-center">
      <AddGig />
    </div>
  );
}
