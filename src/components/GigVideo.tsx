'use client';

import { GigType } from '@/lib/interface';

export default function GigVideo({ gig }: { gig: GigType }) {
  return (
    <div className={'aspect-h-9 aspect-w-16 w-full'}>
      <iframe
        className="rounded-lg px-5 pt-5"
        src={gig.video_playlist}
        title="Playlist"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      ></iframe>
    </div>
  );
}
