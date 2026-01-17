'use client';

import { Mic, Drum, Timer, Music, type LucideProps } from 'lucide-react';
import { TbGuitarPickFilled } from 'react-icons/tb';
import { GiGuitarBassHead } from 'react-icons/gi';
import { PiPianoKeysFill } from 'react-icons/pi';
import type { StemCategory } from '@/types/stems';
import { STEM_CATEGORIES, STEM_TEXT_COLORS } from '@/types/stems';
import { cn } from '@/lib/utils';

interface StemTrackIconProps {
  category: StemCategory;
  className?: string;
  size?: number;
}

type IconComponent = React.ComponentType<LucideProps> | React.ComponentType<{ size?: number; className?: string }>;

const STEM_ICONS: Record<StemCategory, IconComponent> = {
  [STEM_CATEGORIES.VOCALS]: Mic,
  [STEM_CATEGORIES.GUITAR]: TbGuitarPickFilled,
  [STEM_CATEGORIES.BASS]: GiGuitarBassHead,
  [STEM_CATEGORIES.DRUMS]: Drum,
  [STEM_CATEGORIES.KEYS]: PiPianoKeysFill,
  [STEM_CATEGORIES.METRONOME]: Timer,
  [STEM_CATEGORIES.OTHER]: Music,
};

export function StemTrackIcon({ category, className, size = 20 }: StemTrackIconProps) {
  const Icon = STEM_ICONS[category];
  const colorClass = STEM_TEXT_COLORS[category];

  return (
    <Icon
      size={size}
      className={cn(colorClass, className)}
    />
  );
}
