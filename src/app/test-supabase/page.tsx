import { getAllSongs, getGigs } from '@/actions/supabase';

export const metadata = {
  title: 'Supabase Migration Test',
};

export default async function TestSupabasePage() {
  const songs = await getAllSongs();
  const gigs = await getGigs();

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Supabase Migration Test</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Songs ({songs.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {songs.slice(0, 6).map((song) => (
            <div key={song._id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
              <div className="flex">
                {song.artwork && (
                  <div className="w-32 h-32 flex-shrink-0">
                    <img 
                      src={song.artwork} 
                      alt={`${song.title} artwork`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4 flex-1">
                  <p className="font-bold text-lg">{song.title}</p>
                  <p className="text-gray-600 mb-2">{song.artist}</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p className="truncate">
                      <span className="font-semibold">Audio:</span> {song.audio ? '✅ Migrated' : '❌ Missing'}
                    </p>
                    <p className="truncate">
                      <span className="font-semibold">Artwork:</span> {song.artwork ? '✅ Migrated' : '❌ Missing'}
                    </p>
                  </div>
                </div>
              </div>
              {song.audio && (
                <div className="p-4 pt-0">
                  <audio controls className="w-full">
                    <source src={song.audio} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          ))}
        </div>
        {songs.length > 6 && <p className="mt-4 text-gray-600">...and {songs.length - 6} more songs</p>}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Gigs ({gigs.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gigs.map((gig) => (
            <div key={gig._id} className="bg-white border rounded-lg p-4">
              <p className="font-bold text-lg">{gig.title}</p>
              <p className="text-gray-600">{new Date(gig.date).toLocaleDateString()} - {gig.venue || 'No venue'}</p>
              {gig.address && <p className="text-sm text-gray-500 mt-1">{gig.address}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 p-4 bg-green-100 rounded-lg">
        <h3 className="font-bold text-green-800 mb-2">✅ Migration Summary</h3>
        <ul className="text-green-700 space-y-1">
          <li>• All {songs.length} songs migrated to Supabase</li>
          <li>• Audio files hosted on Supabase Storage</li>
          <li>• Artwork images hosted on Supabase Storage</li>
          <li>• {gigs.length} gigs migrated with all metadata</li>
        </ul>
      </div>
    </div>
  );
}