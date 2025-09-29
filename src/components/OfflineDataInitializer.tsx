'use client';

import { useEffect, useState } from 'react';
import { offlineSync } from '@/lib/offline-sync';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Loader2 } from 'lucide-react';

export function OfflineDataInitializer({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    const initializeOfflineData = async () => {
      try {
        // Check if we have any local data
        const songs = [] //await offlineSync.getSongs();
        
        if (songs.length === 0 && isOnline) {
          // First time load - fetch all data
          console.log('First time setup - fetching all data...');
          await offlineSync.fetchAndStoreData();
        } else if (isOnline && await offlineSync.needsSync()) {
          // Sync in background if needed
          offlineSync.syncData().catch(console.error);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize offline data:', error);
        // Continue anyway - app should work with or without initial data
        setIsInitialized(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeOfflineData();
  }, [isOnline]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 mb-4" />
        <p className="text-sm text-muted-foreground">
          {isOnline ? 'Loading your music...' : 'Loading offline data...'}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}