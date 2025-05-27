'use server';

import { 
  getAllSongs as getAllSongsFromSupabase,
  getSetlist as getSetlistFromSupabase,
  getLyrics as getLyricsFromSupabase,
  getLyricsBySlug as getLyricsBySlugFromSupabase,
  getGigs as getGigsFromSupabase,
  getGig as getGigFromSupabase,
  getPublicGigs as getPublicGigsFromSupabase,
  removeSongFromSetlist as removeSongFromSetlistSupabase,
  updateSetlistSongs as updateSetlistSongsSupabase,
  getSongWithStats as getSongWithStatsSupabase,
  getSongWithStatsBySlug as getSongWithStatsBySlugSupabase,
  modifyLyrics as modifyLyricsSupabase,
  updateSong as updateSongSupabase,
  createGig as createGigSupabase,
  createGigWithSetlist as createGigWithSetlistSupabase,
  updateGig as updateGigSupabase,
  addPause as addPauseSupabase
} from '@/lib/supabase-service';

export async function getAllSongs() {
  return getAllSongsFromSupabase();
}

export async function getSetlist(title: string) {
  return getSetlistFromSupabase(title);
}

export async function getLyrics(id: string) {
  return getLyricsFromSupabase(id);
}

export async function getLyricsBySlug(slug: string) {
  return getLyricsBySlugFromSupabase(slug);
}

export async function getGigs() {
  return getGigsFromSupabase();
}

export async function getGig(id: string) {
  return getGigFromSupabase(id);
}

export async function getPublicGigs() {
  return getPublicGigsFromSupabase();
}

export async function removeSongFromSetlist(setlistId: string, itemId: string) {
  return removeSongFromSetlistSupabase(setlistId, itemId);
}

export async function updateSetlistSongs(setlistId: string, songs: any[]) {
  return updateSetlistSongsSupabase(setlistId, songs);
}

export async function getSongWithStats(id: string) {
  return getSongWithStatsSupabase(id);
}

export async function getSongWithStatsBySlug(slug: string) {
  return getSongWithStatsBySlugSupabase(slug);
}

export async function modifyLyrics(songId: string, lyrics: string) {
  return modifyLyricsSupabase(songId, lyrics);
}

export async function updateSong(songId: string, updates: any) {
  return updateSongSupabase(songId, updates);
}

export async function createGig(gig: any) {
  return createGigSupabase(gig);
}

export async function createGigWithSetlist(gig: any) {
  return createGigWithSetlistSupabase(gig);
}

export async function updateGig(id: string, gig: any) {
  return updateGigSupabase(id, gig);
}

export async function addPause(pause: any, setlist: any) {
  return addPauseSupabase(pause, setlist);
}

export async function markSongPracticed(songId: string) {
  const { markSongPracticed: markSongPracticedSupabase } = await import('@/lib/supabase-service');
  return markSongPracticedSupabase(songId);
}

export async function getSongLinks(songId: string) {
  const { getSongLinks: getSongLinksSupabase } = await import('@/lib/supabase-service');
  return getSongLinksSupabase(songId);
}

export async function createSongLink(songId: string, link: { link_type: string; url: string; title?: string }) {
  const { createSongLink: createSongLinkSupabase } = await import('@/lib/supabase-service');
  return createSongLinkSupabase(songId, link);
}

export async function updateSongLink(linkId: string, updates: any) {
  const { updateSongLink: updateSongLinkSupabase } = await import('@/lib/supabase-service');
  return updateSongLinkSupabase(linkId, updates);
}

export async function deleteSongLink(linkId: string) {
  const { deleteSongLink: deleteSongLinkSupabase } = await import('@/lib/supabase-service');
  return deleteSongLinkSupabase(linkId);
}