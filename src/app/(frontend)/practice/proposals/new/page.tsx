'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NavigationLink } from '@/components/NavigationButton';
import { THEME } from '@/themes';
import { ArrowLeft, Search, Music, Album, CheckCircle2, ExternalLink } from 'lucide-react';

interface ProposalFormData {
  title: string;
  artist: string;
}

interface SpotifyTrackOption {
  id: string;
  name: string;
  albumName: string;
  artists: string[];
  imageUrl: string | null;
  previewUrl: string | null;
  uri: string;
  externalUrl: string | null;
}

export default function NewProposalPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProposalFormData>({ title: '', artist: '' });
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [tracks, setTracks] = useState<SpotifyTrackOption[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrackOption | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpotifySearch = async () => {
    if (!formData.title.trim() || !formData.artist.trim()) {
      setSearchError('Vul zowel titel als artiest in om te zoeken.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchPerformed(true);
    setSelectedTrack(null);

    try {
      const response = await fetch('/api/spotify/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          artist: formData.artist
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Zoeken op Spotify mislukt');
      }

      const mappedTracks: SpotifyTrackOption[] = (data.results || [])
        .map((item: any) => {
          const images: Array<{ url: string; width: number | null; height: number | null }> = item.images || [];
          const sortedImages = [...images].sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
          const bestImage = sortedImages[0] ?? null;

          return {
            id: item.id as string,
            name: item.name as string,
            albumName: item.albumName as string,
            artists: item.artists as string[],
            imageUrl: bestImage?.url ?? null,
            previewUrl: item.previewUrl ?? null,
            uri: item.uri as string,
            externalUrl: item.externalUrl ?? null
          } satisfies SpotifyTrackOption;
        });

      setTracks(mappedTracks);

      if (!mappedTracks.length) {
        setSearchError('Geen resultaten gevonden. Controleer de titel of artiest.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Zoeken op Spotify mislukt';
      setSearchError(message);
      setTracks([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveProposal = async () => {
    if (!selectedTrack) return;

    setIsSaving(true);

    try {
      const response = await fetch('/api/practice/proposals/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: selectedTrack.name,
          band: selectedTrack.artists.join(', '),
          album: selectedTrack.albumName,
          coverart: selectedTrack.imageUrl ?? undefined,
          uri: selectedTrack.externalUrl ?? undefined
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Opslaan mislukt');
      }

      router.push('/practice/proposals');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Opslaan mislukt';
      alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Nieuw Voorstel</h1>
          <p className="text-gray-400">Zoek een nummer op Spotify en sla het op voor later.</p>
        </div>
        <NavigationLink
          href="/practice/proposals"
          className={`px-4 py-2 ${THEME.highlight} ${THEME.text} border ${THEME.border} rounded-md font-medium transition-colors`}
          icon={<ArrowLeft className="h-4 w-4" />}
        >
          Terug
        </NavigationLink>
      </div>

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Songtitel *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Bijv. Uptown Funk"
              className="bg-zinc-800 text-white border-zinc-600 focus:border-rose-400 focus:ring-rose-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="artist">Artiest *</Label>
            <Input
              id="artist"
              name="artist"
              value={formData.artist}
              onChange={handleInputChange}
              placeholder="Bijv. Mark Ronson"
              className="bg-zinc-800 text-white border-zinc-600 focus:border-rose-400 focus:ring-rose-400"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={handleSpotifySearch}
            disabled={isSearching || !formData.title.trim() || !formData.artist.trim()}
            className={`${THEME.primaryBg} hover:${THEME.primaryBgDark} text-white flex items-center gap-2`}
          >
            {isSearching ? (
              <span>Zoeken...</span>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Zoek op Spotify
              </>
            )}
          </Button>

          {searchError && (
            <p className="text-sm text-rose-400">{searchError}</p>
          )}
        </div>

        {isSearching && <p className="text-sm text-gray-400">Spotify zoeken…</p>}

        {!isSearching && searchPerformed && tracks.length === 0 && !searchError && (
          <p className="text-sm text-gray-400">Geen resultaten gevonden.</p>
        )}

        {tracks.length > 0 && (
          <div className="grid gap-4">
            {tracks.map(track => {
              const isSelected = selectedTrack?.id === track.id;

              return (
                <div
                  key={track.id}
                  className={`rounded-lg border px-4 py-3 transition-colors ${isSelected ? 'border-rose-400 bg-rose-400/5' : `${THEME.border} bg-zinc-900 hover:border-rose-400/70`
                    }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3 flex-1">
                      {track.imageUrl ? (
                        <img
                          src={track.imageUrl}
                          alt={`Albumcover voor ${track.albumName}`}
                          className="h-16 w-16 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-md bg-zinc-800 flex items-center justify-center text-gray-500">
                          <Album className="h-6 w-6" />
                        </div>
                      )}
                      <div className="space-y-1 text-sm">
                        <p className="font-semibold text-gray-100 flex items-center gap-2">
                          <Music className="h-4 w-4 text-rose-400" /> {track.name}
                        </p>
                        <p className="text-gray-400 text-sm">{track.artists.join(', ')}</p>
                        <p className="text-xs text-gray-500 italic">{track.albumName}</p>
                        {track.externalUrl && (
                          <a
                            className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300"
                            href={track.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open op Spotify
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:justify-center">
                      <Button
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                        className={isSelected ? `${THEME.primaryBg} text-white` : `${THEME.highlight} ${THEME.text} border ${THEME.border}`}
                        onClick={() => setSelectedTrack(track)}
                      >
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> Geselecteerd
                          </span>
                        ) : (
                          'Selecteren'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-4">
          <Button
            type="button"
            onClick={handleSaveProposal}
            disabled={!selectedTrack || isSaving}
            className={`w-full sm:w-auto ${THEME.primaryBg} hover:${THEME.primaryBgDark} text-white flex items-center justify-center gap-2`}
          >
            {isSaving ? 'Opslaan…' : 'Voorstel Opslaan'}
          </Button>
        </div>
      </div>
    </div>
  );
}
