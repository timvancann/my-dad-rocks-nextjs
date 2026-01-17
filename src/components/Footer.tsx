'use client';
import { Navbar } from '@/components/Navbar';
import { PlayerMini } from '@/components/PlayerMini';
import { usePathname } from 'next/navigation';
import { usePlayerStore } from '@/store/store';

export const Footer = () => {
  const path = usePathname();
  const { isFullscreen } = usePlayerStore();

  // Hide entire footer when in fullscreen mode
  if (isFullscreen) {
    return null;
  }

  // Hide mini player when on the unified player page
  const isOnPlayerPage = path === '/practice/player';

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 flex flex-col">
      {!isOnPlayerPage && <PlayerMini />}
      <Navbar />
    </div>
  );
};
