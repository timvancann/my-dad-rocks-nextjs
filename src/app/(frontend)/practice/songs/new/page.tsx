'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { THEME } from '@/themes';
import { ArrowLeft, Upload, Music, Image, Save } from 'lucide-react';
import { NavigationLink } from '@/components/NavigationButton';

interface NewSongFormData {
  title: string;
  artist: string;
  coverArt: File | null;
  audioFile: File | null;
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
      return;
    }

    if (fileType === 'coverArt') {
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
            <Image className="inline h-4 w-4 mr-1" />
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
