'use client';
import { Navbar } from '@/components/Navbar';
import { PlayerMini } from '@/components/PlayerMini';
import { usePathname } from 'next/navigation';

export const Footer = () => {
  const path = usePathname();
  return (
    <div className='fixed inset-x-0 bottom-0 flex flex-col gap-1'>
      {path != '/player' && <PlayerMini />}
      <Navbar />
    </div>
  );
};
