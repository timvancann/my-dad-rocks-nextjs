'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { THEME } from '@/themes';
import { ArrowLeft, Upload, Music, Image as ImageIcon, Save } from 'lucide-react';
import { NavigationLink } from '@/components/NavigationButton';

interface NewSongFormData {
  title: string;
  artist: string;
  coverArt: File | null;
  audioFile: File | null;
}

interface SpotifyArtworkOption {
  id: string;
  name: string;
  albumName: string;
  artists: string[];
  imageUrl: string;
  previewUrl: string | null;
  uri: string;
  externalUrl: string | null;
}

export default function NewSongPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<NewSongFormData>({
    title: '',
    artist: '',
    coverArt: null,
    audioFile: null
  });
  const [previews, setPreviews] = useState({
    coverArt: '',
    audioFile: ''
  });
  const [isDragging, setIsDragging] = useState({
    coverArt: false,
    audioFile: false
  });
  const [spotifyResults, setSpotifyResults] = useState<SpotifyArtworkOption[]>([]);
  const [spotifyError, setSpotifyError] = useState<string | null>(null);
  const [isSpotifyLoading, setIsSpotifyLoading] = useState(false);
  const [spotifySearched, setSpotifySearched] = useState(false);
  const [selectedSpotifyArtwork, setSelectedSpotifyArtwork] = useState<SpotifyArtworkOption | null>(null);

  const handleFileSelect = (file: File | null, fileType: 'coverArt' | 'audioFile') => {
    setFormData(prev => ({
      ...prev,
      [fileType]: file
    }));

    if (!file) {
      setPreviews(prev => ({
        ...prev,
        [fileType]: ''
      }));
      if (fileType === 'coverArt') {
        setSelectedSpotifyArtwork(null);
      }
      return;
    }

    if (fileType === 'coverArt') {
      setSelectedSpotifyArtwork(null);
      const reader = new FileReader();
      reader.onload = event => {
        setPreviews(prev => ({
          ...prev,
          coverArt: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }

    if (fileType === 'audioFile') {
      const audioUrl = URL.createObjectURL(file);
      setPreviews(prev => ({
        ...prev,
        audioFile: audioUrl
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'coverArt' | 'audioFile') => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file || null, fileType);
  };

  const handleDragState = (fileType: 'coverArt' | 'audioFile', active: boolean) => {
    setIsDragging(prev => ({
      ...prev,
      [fileType]: active
    }));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, fileType: 'coverArt' | 'audioFile') => {
    e.preventDefault();
    handleDragState(fileType, false);

    const file = e.dataTransfer.files?.[0];
    if (!file) {
      return;
    }

    if (fileType === 'coverArt' && !file.type.startsWith('image/')) {
      alert('Kies een geldig afbeeldingsbestand voor de cover art.');
      return;
    }

    if (fileType === 'audioFile' && !file.type.startsWith('audio/')) {
      alert('Kies een geldig audiobestand.');
      return;
    }

    handleFileSelect(file, fileType);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, fileType: 'coverArt' | 'audioFile') => {
    e.preventDefault();
    handleDragState(fileType, true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, fileType: 'coverArt' | 'audioFile') => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    handleDragState(fileType, false);
  };

  const openFileDialog = (fileType: 'coverArt' | 'audioFile') => {
    document.getElementById(fileType)?.click();
  };

  const handleSpotifySearch = async () => {
    if (!formData.title.trim() || !formData.artist.trim()) {
      setSpotifyError('Voer zowel titel als artiest in om op Spotify te zoeken.');
      return;
    }

    setSpotifyError(null);
    setIsSpotifyLoading(true);
    setSpotifySearched(true);
    setSelectedSpotifyArtwork(prev => {
      if (prev) {
        setPreviews(current => ({
          ...current,
          coverArt: ''
        }));
      }
      return null;
    });

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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Spotify zoekopdracht mislukt');
      }

      const parsedResults: SpotifyArtworkOption[] = (result.results || [])
        .map((item: any) => {
          const images: Array<{ url: string; width: number | null; height: number | null }> = item.images || [];
          const sortedImages = [...images].sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
          const bestImage = sortedImages[0];

          if (!bestImage?.url) {
            return null;
          }

            return {
              id: item.id as string,
              name: item.name as string,
              albumName: item.albumName as string,
              artists: item.artists as string[],
              imageUrl: bestImage.url,
              previewUrl: item.previewUrl ?? null,
              uri: item.uri as string,
              externalUrl: item.externalUrl ?? null
            } satisfies SpotifyArtworkOption;
        })
        .filter(Boolean) as SpotifyArtworkOption[];

      setSpotifyResults(parsedResults);

      if (!parsedResults.length) {
        setSpotifyError('Geen albumart gevonden op Spotify. Controleer de titel en artiest.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Spotify zoekopdracht mislukt';
      setSpotifyError(message);
      setSpotifyResults([]);
    } finally {
      setIsSpotifyLoading(false);
    }
  };

  const handleSelectSpotifyArtwork = (option: SpotifyArtworkOption) => {
    setSelectedSpotifyArtwork(option);
    setPreviews(prev => ({
      ...prev,
      coverArt: option.imageUrl
    }));
    setFormData(prev => ({
      ...prev,
      coverArt: null
    }));
  };

  const clearSpotifySelection = () => {
    setSelectedSpotifyArtwork(null);
    setPreviews(prev => ({
      ...prev,
      coverArt: ''
    }));
  };

  const calculateAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const objectUrl = URL.createObjectURL(file);
      
      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(objectUrl);
        resolve(Math.round(audio.duration));
      });
      
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load audio file'));
      });
      
      audio.src = objectUrl;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.artist) {
      alert('Titel en artiest zijn verplicht');
      return;
    }

    setIsSubmitting(true);
    
    try {
      let duration = 0;
      if (formData.audioFile) {
        duration = await calculateAudioDuration(formData.audioFile);
      }

      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('artist', formData.artist);
      if (duration) {
        payload.append('duration_seconds', String(duration));
      }
      if (formData.coverArt) {
        payload.append('coverArt', formData.coverArt);
      }
      if (formData.audioFile) {
        payload.append('audioFile', formData.audioFile);
      }
      if (selectedSpotifyArtwork) {
        payload.append('spotifyImageUrl', selectedSpotifyArtwork.imageUrl);
      }

      const response = await fetch('/api/practice/songs/create', {
        method: 'POST',
        body: payload
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload mislukt');
      }

      router.push(`/practice/song/${result.song.slug}`);
      
    } catch (error) {
      console.error('Error creating song:', error);
      alert('Er is een fout opgetreden bij het aanmaken van het nummer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2">Nieuw Nummer</h1>
          <p className="text-gray-400">Voeg een nieuw nummer toe aan het repertoire</p>
        </div>
        <NavigationLink 
          href="/practice/repertoire"
          className={`px-4 py-2 ${THEME.highlight} hover:bg-zinc-700 ${THEME.text} rounded-md font-medium transition-colors border ${THEME.border}`}
          icon={<ArrowLeft className="h-4 w-4" />}
        >
          Terug
        </NavigationLink>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Nummer titel"
              className="bg-zinc-800 text-white border-zinc-600 focus:border-rose-400 focus:ring-rose-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="artist">Artiest *</Label>
            <Input
              id="artist"
              name="artist"
              value={formData.artist}
              onChange={handleInputChange}
              placeholder="Artiest naam"
              className="bg-zinc-800 text-white border-zinc-600 focus:border-rose-400 focus:ring-rose-400"
              required
            />
          </div>
        </div>

        {/* Cover Art Upload */}
        <div className="space-y-4">
          <Label>
            <ImageIcon className="inline h-4 w-4 mr-1" />
            Cover Art
          </Label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'coverArt')}
            className="hidden"
            id="coverArt"
          />

          <div className="flex items-start gap-4">
            <div
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openFileDialog('coverArt');
                }
              }}
              onClick={() => openFileDialog('coverArt')}
              onDragEnter={e => handleDragEnter(e, 'coverArt')}
              onDragOver={handleDragOver}
              onDragLeave={e => handleDragLeave(e, 'coverArt')}
              onDrop={e => handleDrop(e, 'coverArt')}
              className={`flex-1 rounded-md border-2 border-dashed px-4 py-6 text-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                isDragging.coverArt ? 'border-rose-400 bg-zinc-800/60' : `${THEME.border} bg-zinc-900`
              }`}
            >
              <Upload className="mx-auto mb-3 h-6 w-6" />
              <p className="text-sm font-medium">
                {formData.coverArt ? 'Sleep een nieuwe afbeelding hierheen of klik om te vervangen' : 'Sleep cover art hierheen of klik om te kiezen'}
              </p>
              <p className="mt-1 text-xs text-gray-400">Ondersteunt PNG, JPG, GIF</p>
              {formData.coverArt && (
                <p className="mt-2 text-xs text-gray-500">Geselecteerd: {formData.coverArt.name}</p>
              )}
            </div>

            {previews.coverArt && (
              <div className="w-24 h-24 rounded-lg overflow-hidden border border-zinc-600">
                <img
                  src={previews.coverArt}
                  alt="Cover art preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-400">Geen bestand bij de hand? Zoek artwork op Spotify.</p>
              <Button
                type="button"
                variant="outline"
                onClick={handleSpotifySearch}
                disabled={isSpotifyLoading}
                className={`${THEME.highlight} ${THEME.text} border ${THEME.border}`}
              >
                {isSpotifyLoading ? 'Zoeken…' : 'Zoek op Spotify'}
              </Button>
            </div>
            {spotifyError && (
              <p className="text-sm text-rose-400">{spotifyError}</p>
            )}
          </div>

          {selectedSpotifyArtwork && (
            <div className="flex items-center gap-4 rounded-md border border-zinc-700 bg-zinc-900/70 p-3">
              <img
                src={selectedSpotifyArtwork.imageUrl}
                alt={`Geselecteerde artwork voor ${selectedSpotifyArtwork.albumName}`}
                className="h-16 w-16 rounded-md object-cover"
              />
              <div className="flex-1 text-sm">
                <p className="font-medium text-white">{selectedSpotifyArtwork.albumName}</p>
                <p className="text-gray-400">{selectedSpotifyArtwork.artists.join(', ')}</p>
                <p className="text-xs text-gray-500">Bron: Spotify</p>
              </div>
              <Button type="button" variant="ghost" onClick={clearSpotifySelection} className="text-rose-400 hover:text-rose-300">
                Verwijder selectie
              </Button>
            </div>
          )}

          {isSpotifyLoading && (
            <p className="text-sm text-gray-400">Spotify zoeken…</p>
          )}

          {spotifyResults.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {spotifyResults.map(option => (
                <button
                  type="button"
                  key={option.id}
                  onClick={() => handleSelectSpotifyArtwork(option)}
                  className={`flex items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors ${
                    selectedSpotifyArtwork?.id === option.id ? 'border-rose-400 bg-rose-400/10' : `${THEME.border} bg-zinc-900 hover:border-rose-400`
                  }`}
                >
                  <img
                    src={option.imageUrl}
                    alt={`Album art voor ${option.albumName}`}
                    className="h-14 w-14 flex-shrink-0 rounded-md object-cover"
                  />
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-white">{option.albumName}</p>
                    <p className="text-xs text-gray-400">{option.artists.join(', ')}</p>
                    <p className="text-xs text-rose-400">Klik om te selecteren</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!isSpotifyLoading && spotifySearched && !spotifyResults.length && !selectedSpotifyArtwork && !spotifyError && (
            <p className="text-sm text-gray-400">Geen resultaten gevonden. Pas je zoekopdracht aan of upload handmatig.</p>
          )}
        </div>

        {/* Audio File Upload */}
        <div className="space-y-4">
          <Label>
            <Music className="inline h-4 w-4 mr-1" />
            Audio Bestand
          </Label>
          
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => handleFileChange(e, 'audioFile')}
            className="hidden"
            id="audioFile"
          />

          <div className="space-y-3">
            <div
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openFileDialog('audioFile');
                }
              }}
              onClick={() => openFileDialog('audioFile')}
              onDragEnter={e => handleDragEnter(e, 'audioFile')}
              onDragOver={handleDragOver}
              onDragLeave={e => handleDragLeave(e, 'audioFile')}
              onDrop={e => handleDrop(e, 'audioFile')}
              className={`rounded-md border-2 border-dashed px-4 py-6 text-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                isDragging.audioFile ? 'border-rose-400 bg-zinc-800/60' : `${THEME.border} bg-zinc-900`
              }`}
            >
              <Upload className="mx-auto mb-3 h-6 w-6" />
              <p className="text-sm font-medium">
                {formData.audioFile ? 'Sleep een nieuw audiobestand hierheen of klik om te vervangen' : 'Sleep een audiobestand hierheen of klik om te kiezen'}
              </p>
              <p className="mt-1 text-xs text-gray-400">Ondersteunt MP3, WAV, FLAC</p>
              {formData.audioFile && (
                <p className="mt-2 text-xs text-gray-500">Geselecteerd: {formData.audioFile.name}</p>
              )}
            </div>

            {previews.audioFile && (
              <audio controls className="w-full">
                <source src={previews.audioFile} />
                Je browser ondersteunt het audio element niet.
              </audio>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <Button
            type="submit"
            disabled={isSubmitting || !formData.title || !formData.artist}
            className={`w-full ${THEME.primaryBg} hover:${THEME.primaryBgDark} text-white`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Bezig met aanmaken...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Nummer Aanmaken
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
