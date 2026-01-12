// Types for multi-track stem player

export interface Stem {
  id: string;
  title: string;
  url: string;
  duration: number | null;
  description?: string | null;
  sortOrder: number;
}

export interface StemPlayerState {
  stems: Stem[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  mutedStems: Set<string>; // Set of stem IDs that are muted
  soloStem: string | null; // ID of stem that is solo'd (mutes all others)
  volume: Record<string, number>; // Volume per stem (0-1)
}

export interface StemAudioElement {
  id: string;
  audio: HTMLAudioElement;
  isLoaded: boolean;
}

// Stem type categories for UI organization
export const STEM_CATEGORIES = {
  VOCALS: 'vocals',
  GUITAR: 'guitar',
  BASS: 'bass',
  DRUMS: 'drums',
  KEYS: 'keys',
  METRONOME: 'metronome',
  OTHER: 'other',
} as const;

export type StemCategory = typeof STEM_CATEGORIES[keyof typeof STEM_CATEGORIES];

// Helper to infer stem category from title
export function inferStemCategory(title: string): StemCategory {
  const lower = title.toLowerCase();

  if (lower.includes('vocal') || lower.includes('singing') || lower.includes('voice')) {
    return STEM_CATEGORIES.VOCALS;
  }
  if (lower.includes('guitar')) {
    return STEM_CATEGORIES.GUITAR;
  }
  if (lower.includes('bass')) {
    return STEM_CATEGORIES.BASS;
  }
  if (lower.includes('drum') || lower.includes('percussion')) {
    return STEM_CATEGORIES.DRUMS;
  }
  if (lower.includes('key') || lower.includes('piano') || lower.includes('synth')) {
    return STEM_CATEGORIES.KEYS;
  }
  if (lower.includes('metronome') || lower.includes('click')) {
    return STEM_CATEGORIES.METRONOME;
  }

  return STEM_CATEGORIES.OTHER;
}

// Color mapping for stem categories
export const STEM_COLORS: Record<StemCategory, string> = {
  [STEM_CATEGORIES.VOCALS]: 'bg-blue-500',
  [STEM_CATEGORIES.GUITAR]: 'bg-orange-500',
  [STEM_CATEGORIES.BASS]: 'bg-purple-500',
  [STEM_CATEGORIES.DRUMS]: 'bg-red-500',
  [STEM_CATEGORIES.KEYS]: 'bg-green-500',
  [STEM_CATEGORIES.METRONOME]: 'bg-gray-500',
  [STEM_CATEGORIES.OTHER]: 'bg-yellow-500',
};
