import { Track } from '@payload-types';
import React from 'react';
import { Image as PayloadImage } from '@payload-types';
import Image from 'next/image'

type TrackCoverArtProps = {
  className?: string;
  track: Track;
};

export const TrackCoverArt = ({ track, className }: TrackCoverArtProps) => {
  const coverart = track.coverart as PayloadImage
  return <Image src={coverart.thumbnailURL ?? ""} alt={coverart.alt} className={`w-16 h-16 rounded-xl ${className}`} />;
};
