import { getSongWithStats } from '@/actions/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { THEME } from '@/themes';
import { Calendar, Clock, Guitar, Hash, Mic, Music, Star, Tag, Users } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

function SongSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Skeleton className="h-12 w-3/4 mb-2" />
      <Skeleton className="h-6 w-1/2 mb-8" />
      <div className="grid gap-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}

function getDifficultyColor(level: number) {
  const colors = ['text-green-600', 'text-blue-600', 'text-yellow-600', 'text-orange-600', 'text-red-600'];
  return colors[level - 1] || colors[0];
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function SongDetails({ id }: { id: string }) {
  const result = await getSongWithStats(id);
  
  if (!result) {
    notFound();
  }

  const { song, stats } = result;
  
  // Get the raw song data to access new fields
  const rawSong = song as any;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{song.title}</h1>
        {song.artist && <p className="text-xl text-gray-400">{song.artist}</p>}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-8">
        <Link href={`/practice/lyrics/${id}`} className={`inline-flex items-center gap-2 px-6 py-3 ${THEME.primaryBg} hover:${THEME.primaryBgDark} text-white rounded-md font-medium transition-colors`}>
          <Music className="h-4 w-4" />
          Bekijk Songtekst
        </Link>
        <Link href="/practice/player" className={`inline-flex items-center gap-2 px-6 py-3 ${THEME.highlight} hover:bg-zinc-700 ${THEME.text} rounded-md font-medium transition-colors border ${THEME.border}`}>
          <Clock className="h-4 w-4" />
          Oefen Modus
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Song Information */}
        <Card>
          <CardHeader>
            <CardTitle>Nummer Informatie</CardTitle>
            <CardDescription>Muzikale details en metadata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rawSong.key_signature && (
              <div className="flex items-center gap-2">
                <Hash className={`h-4 w-4 ${THEME.secondary}`} />
                <span className="font-medium">Toonsoort:</span>
                <span>{rawSong.key_signature}</span>
              </div>
            )}
            
            {rawSong.tempo_bpm && (
              <div className="flex items-center gap-2">
                <Clock className={`h-4 w-4 ${THEME.secondary}`} />
                <span className="font-medium">Tempo:</span>
                <span>{rawSong.tempo_bpm} BPM</span>
              </div>
            )}
            
            {song.duration && (
              <div className="flex items-center gap-2">
                <Music className={`h-4 w-4 ${THEME.secondary}`} />
                <span className="font-medium">Duur:</span>
                <span>{formatDuration(song.duration)}</span>
              </div>
            )}
            
            {rawSong.difficulty_level && (
              <div className="flex items-center gap-2">
                <Star className={`h-4 w-4 ${THEME.secondary}`} />
                <span className="font-medium">Moeilijkheidsgraad:</span>
                <span className={getDifficultyColor(rawSong.difficulty_level)}>
                  {'★'.repeat(rawSong.difficulty_level)}{'☆'.repeat(5 - rawSong.difficulty_level)}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Users className={`h-4 w-4 ${THEME.secondary}`} />
              <span className="font-medium">Arrangement:</span>
              <div className="flex gap-2">
                {song.dualGuitar && (
                  <Badge variant="secondary">
                    <Guitar className="mr-1 h-3 w-3" />
                    Dubbele Gitaar
                  </Badge>
                )}
                {song.dualVocal && (
                  <Badge variant="secondary">
                    <Mic className="mr-1 h-3 w-3" />
                    Dubbele Zang
                  </Badge>
                )}
                {!song.dualGuitar && !song.dualVocal && <span className="text-gray-400">Standaard</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Optreden Statistieken</CardTitle>
            <CardDescription>Oefen- en optredengeschiedenis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Music className={`h-4 w-4 ${THEME.secondary}`} />
              <span className="font-medium">Keer Gespeeld:</span>
              <span>{stats.times_played || 0}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className={`h-4 w-4 ${THEME.secondary}`} />
              <span className="font-medium">Keer Geoefend:</span>
              <span>{stats.times_practiced || 0}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Star className={`h-4 w-4 ${THEME.secondary}`} />
              <span className="font-medium">Beheersingsniveau:</span>
              <span className={getDifficultyColor(stats.mastery_level || 1)}>
                {'★'.repeat(stats.mastery_level || 1)}{'☆'.repeat(5 - (stats.mastery_level || 1))}
              </span>
            </div>
            
            {stats.last_practiced_at && (
              <div className="flex items-center gap-2">
                <Calendar className={`h-4 w-4 ${THEME.secondary}`} />
                <span className="font-medium">Laatst Geoefend:</span>
                <span>{new Date(stats.last_practiced_at).toLocaleDateString()}</span>
              </div>
            )}
            
            {song.last_played_at && (
              <div className="flex items-center gap-2">
                <Calendar className={`h-4 w-4 ${THEME.secondary}`} />
                <span className="font-medium">Laatst Live Gespeeld:</span>
                <span>{new Date(song.last_played_at).toLocaleDateString()}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags */}
        {rawSong.tags && rawSong.tags.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Muzikale kenmerken en genres</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {rawSong.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline">
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {song.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Band Notities</CardTitle>
              <CardDescription>Speciale instructies of herinneringen</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{song.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Media */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Media</CardTitle>
            <CardDescription>Audio en artwork</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {song.artwork && (
                <div>
                  <h4 className="font-medium mb-2">Artwork</h4>
                  <img 
                    src={song.artwork} 
                    alt={`${song.title} artwork`}
                    className="rounded-lg shadow-md w-full max-w-xs"
                  />
                </div>
              )}
              {song.audio && (
                <div>
                  <h4 className="font-medium mb-2">Audio Track</h4>
                  <audio controls className="w-full">
                    <source src={song.audio} type="audio/mpeg" />
                    Je browser ondersteunt het audio element niet.
                  </audio>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default async function SongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <Suspense fallback={<SongSkeleton />}>
      <SongDetails id={id} />
    </Suspense>
  );
}