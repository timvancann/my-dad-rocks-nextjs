'use client';
import { Navbar } from '@/components/Navbar';
import { PlayerMini } from '@/components/PlayerMini';
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
