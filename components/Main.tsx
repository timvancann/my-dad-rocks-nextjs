'use client';
import React from 'react';
import { useSongDetailStore } from '@/store/store';

export const Main = ({ children }: { children: React.ReactNode }) => {
  const songDetail = useSongDetailStore((state) => state.song);

  return (
    <div className={`${songDetail? "opacity-20":"opacity-100"} transition-opacity duration-200`}>
      <main className={'pb-16'}>{children}</main>
    </div>
  );
};
