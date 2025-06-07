'use client';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function NetworkStatus() {
  const { isOnline, isSlowConnection } = useNetworkStatus();
  const [showStatus, setShowStatus] = useState(false);
  const [lastOnlineState, setLastOnlineState] = useState(isOnline);

  useEffect(() => {
    // Show status when going offline or coming back online
    if (lastOnlineState !== isOnline) {
      setShowStatus(true);
      setLastOnlineState(isOnline);

      // Hide status after 3 seconds if online
      if (isOnline) {
        const timer = setTimeout(() => setShowStatus(false), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isOnline, lastOnlineState]);

  // Always show if offline
  useEffect(() => {
    if (!isOnline) {
      setShowStatus(true);
    }
  }, [isOnline]);

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium ${
            isOnline
              ? isSlowConnection
                ? 'bg-yellow-500/90 text-yellow-950'
                : 'bg-green-500/90 text-green-950'
              : 'bg-red-500/90 text-red-950'
          }`}
        >
          {isOnline ? (
            isSlowConnection ? (
              <>
                <AlertCircle size={16} />
                <span>Slow connection detected</span>
              </>
            ) : (
              <>
                <Wifi size={16} />
                <span>Back online</span>
              </>
            )
          ) : (
            <>
              <WifiOff size={16} />
              <span>You&apos;re offline</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}