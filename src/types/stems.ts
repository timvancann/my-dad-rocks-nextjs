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

// Sort order for stem categories
const STEM_SORT_ORDER: Record<StemCategory, number> = {
  [STEM_CATEGORIES.VOCALS]: 0,
  [STEM_CATEGORIES.GUITAR]: 1,
  [STEM_CATEGORIES.BASS]: 2,
  [STEM_CATEGORIES.DRUMS]: 3,
  [STEM_CATEGORIES.KEYS]: 4,
  [STEM_CATEGORIES.OTHER]: 5,
  [STEM_CATEGORIES.METRONOME]: 6,
};

// Helper to sort stems by category
export function sortStemsByCategory(stems: Stem[]): Stem[] {
  return [...stems].sort((a, b) => {
    const catA = inferStemCategory(a.title);
    const catB = inferStemCategory(b.title);
    const orderA = STEM_SORT_ORDER[catA];
    const orderB = STEM_SORT_ORDER[catB];
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    // If same category, maintain original sort order
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });
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

// Hex colors for WaveSurfer waveforms
export const STEM_WAVEFORM_COLORS: Record<StemCategory, { wave: string; progress: string }> = {
  [STEM_CATEGORIES.VOCALS]: { wave: '#3b82f6', progress: '#60a5fa' },
  [STEM_CATEGORIES.GUITAR]: { wave: '#f97316', progress: '#fb923c' },
  [STEM_CATEGORIES.BASS]: { wave: '#a855f7', progress: '#c084fc' },
  [STEM_CATEGORIES.DRUMS]: { wave: '#ef4444', progress: '#f87171' },
  [STEM_CATEGORIES.KEYS]: { wave: '#22c55e', progress: '#4ade80' },
  [STEM_CATEGORIES.METRONOME]: { wave: '#6b7280', progress: '#9ca3af' },
  [STEM_CATEGORIES.OTHER]: { wave: '#eab308', progress: '#facc15' },
};

// Background colors for solo'd tracks
export const STEM_SOLO_BG: Record<StemCategory, string> = {
  [STEM_CATEGORIES.VOCALS]: 'bg-blue-500/20',
  [STEM_CATEGORIES.GUITAR]: 'bg-orange-500/20',
  [STEM_CATEGORIES.BASS]: 'bg-purple-500/20',
  [STEM_CATEGORIES.DRUMS]: 'bg-red-500/20',
  [STEM_CATEGORIES.KEYS]: 'bg-green-500/20',
  [STEM_CATEGORIES.METRONOME]: 'bg-gray-500/20',
  [STEM_CATEGORIES.OTHER]: 'bg-yellow-500/20',
};

// Text colors for stem categories (matching the waveform colors)
export const STEM_TEXT_COLORS: Record<StemCategory, string> = {
  [STEM_CATEGORIES.VOCALS]: 'text-blue-500',
  [STEM_CATEGORIES.GUITAR]: 'text-orange-500',
  [STEM_CATEGORIES.BASS]: 'text-purple-500',
  [STEM_CATEGORIES.DRUMS]: 'text-red-500',
  [STEM_CATEGORIES.KEYS]: 'text-green-500',
  [STEM_CATEGORIES.METRONOME]: 'text-gray-500',
  [STEM_CATEGORIES.OTHER]: 'text-yellow-500',
};
