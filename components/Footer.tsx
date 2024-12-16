'use client';
import { PlayerMini } from '@/components/PlayerMini';
import { Navbar } from '@/components/Navbar';
import React from 'react';
import { usePathname } from 'next/navigation';

export const Footer = () => {
  const path = usePathname();
  return (
    <>
      <Navbar />
      {path != '/player' && <PlayerMini />}
    </>
  );
};
