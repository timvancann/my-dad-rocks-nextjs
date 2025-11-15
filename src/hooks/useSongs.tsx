'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllSongs } from '@/actions/supabase';
import { SongType } from '@/lib/interface';

export function useSongs(initialData?: SongType[]) {
  return useQuery({
    queryKey: ['songs'],
    queryFn: getAllSongs,
    initialData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}
