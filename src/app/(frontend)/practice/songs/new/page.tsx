'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { THEME } from '@/themes';
import { ArrowLeft, Upload, Music, Image, Save } from 'lucide-react';
import { NavigationLink } from '@/components/NavigationButton';
import { createSong } from '@/actions/supabase';

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'coverArt' | 'audioFile') => {
    const file = e.target.files?.[0] || null;
    
    setFormData(prev => ({
      ...prev,
      [fileType]: file
    }));

    // Create preview for cover art
    if (file && fileType === 'coverArt') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => ({
          ...prev,
          coverArt: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }

    // Create preview for audio file
    if (file && fileType === 'audioFile') {
      const audioUrl = URL.createObjectURL(file);
      setPreviews(prev => ({
        ...prev,
        audioFile: audioUrl
      }));
    }
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

  const uploadFile = async (file: File, type: 'cover' | 'audio'): Promise<string> => {
    // For now, we'll create a simple file upload endpoint
    // In a real implementation, you'd upload to Supabase Storage or another service
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const { url } = await response.json();
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.artist) {
      alert('Titel en artiest zijn verplicht');
      return;
    }

    setIsSubmitting(true);
    
    try {
      let coverArtUrl = '';
      let audioUrl = '';
      let duration = 0;

      // Upload cover art if provided
      if (formData.coverArt) {
        coverArtUrl = await uploadFile(formData.coverArt, 'cover');
      }

      // Upload audio file and calculate duration
      if (formData.audioFile) {
        duration = await calculateAudioDuration(formData.audioFile);
        audioUrl = await uploadFile(formData.audioFile, 'audio');
      }

      // Create the song
      const newSong = await createSong({
        title: formData.title,
        artist: formData.artist,
        artwork_url: coverArtUrl,
        audio_url: audioUrl,
        duration_seconds: duration
      });

      // Navigate to the new song's details page
      router.push(`/practice/song/${newSong.slug}`);
      
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
          
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'coverArt')}
                className="hidden"
                id="coverArt"
              />
              <Button
                type="button"
                variant="outline"
                className={`w-full ${THEME.highlight} hover:bg-zinc-700 ${THEME.text} border ${THEME.border}`}
                onClick={() => document.getElementById('coverArt')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {formData.coverArt ? 'Vervang Cover Art' : 'Upload Cover Art'}
              </Button>
              {formData.coverArt && (
                <p className="text-sm text-gray-400 mt-1">
                  {formData.coverArt.name}
                </p>
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
          
          <div className="space-y-3">
            <div>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => handleFileChange(e, 'audioFile')}
                className="hidden"
                id="audioFile"
              />
              <Button
                type="button"
                variant="outline"
                className={`w-full ${THEME.highlight} hover:bg-zinc-700 ${THEME.text} border ${THEME.border}`}
                onClick={() => document.getElementById('audioFile')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {formData.audioFile ? 'Vervang Audio Bestand' : 'Upload Audio Bestand'}
              </Button>
              {formData.audioFile && (
                <p className="text-sm text-gray-400 mt-1">
                  {formData.audioFile.name}
                </p>
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