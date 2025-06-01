'use client';
import { Navbar } from '@/components/Navbar';
import { PlayerMini } from '@/components/PlayerMini';
import { usePathname } from 'next/navigation';
import { usePlayerStore } from '@/store/store';

export const Footer = () => {
  const path = usePathname();
  const { isFullscreen } = usePlayerStore();
  
  if (isFullscreen) {
    return null;
  }
  
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 flex flex-col">
      {path != '/player' && <PlayerMini />}
      <Navbar />
    </div>
  );
};
