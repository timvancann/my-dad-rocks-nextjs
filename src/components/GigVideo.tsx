'use client';

interface GigVideoProps {
  videoPlaylistUrl: string;
}

export default function GigVideo({ videoPlaylistUrl }: GigVideoProps) {
  return (
    <div className={'aspect-h-9 aspect-w-16 w-full'}>
      <iframe
        className="rounded-lg px-5 pt-5"
        src={videoPlaylistUrl}
        title="Playlist"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      ></iframe>
    </div>
  );
}
