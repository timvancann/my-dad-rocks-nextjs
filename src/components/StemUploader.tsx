'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, CheckCircle2, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { STEM_CATEGORIES, STEM_COLORS, type StemCategory } from '@/types/stems';
import { createSongAudioCue } from '@/actions/supabase';

interface StemFile {
  id: string;
  file: File;
  stemType: StemCategory;
  uploading: boolean;
  uploaded: boolean;
  error: string | null;
  duration: number | null;
}

interface StemUploaderProps {
  songId: string;
  songSlug: string;
  onUploadComplete?: () => void;
}

// Helper to extract audio duration from a file
async function extractAudioDuration(file: File): Promise<number | null> {
  try {
    const objectUrl = URL.createObjectURL(file);
    const audio = document.createElement('audio');
    audio.src = objectUrl;
    audio.preload = 'metadata';

    const duration = await new Promise<number>((resolve, reject) => {
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(audio.duration);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Cannot determine audio duration'));
      };
    });

    return Number.isFinite(duration) ? duration : null;
  } catch (error) {
    console.error('Failed to read audio duration', error);
    return null;
  }
}

// Helper to derive a stem title from filename and type
function deriveStemTitle(filename: string, stemType: StemCategory): string {
  // Remove file extension
  const withoutExtension = filename.replace(/\.[^/.]+$/, '');
  // Clean up the filename
  const cleaned = withoutExtension.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();

  // Capitalize the stem type
  const typeLabel = stemType.charAt(0).toUpperCase() + stemType.slice(1);

  // If the filename already contains the stem type, just use the filename
  if (cleaned.toLowerCase().includes(stemType.toLowerCase())) {
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  // Otherwise, prepend the stem type
  return typeLabel;
}

// Helper to guess stem type from filename
function guessStemType(filename: string): StemCategory {
  const lower = filename.toLowerCase();

  if (lower.includes('vocal') || lower.includes('voice') || lower.includes('singing')) {
    return STEM_CATEGORIES.VOCALS;
  }
  if (lower.includes('guitar')) {
    return STEM_CATEGORIES.GUITAR;
  }
  if (lower.includes('bass')) {
    return STEM_CATEGORIES.BASS;
  }
  if (lower.includes('drum') || lower.includes('percussion')) {
    return STEM_CATEGORIES.DRUMS;
  }
  if (lower.includes('key') || lower.includes('piano') || lower.includes('synth')) {
    return STEM_CATEGORIES.KEYS;
  }
  if (lower.includes('metronome') || lower.includes('click')) {
    return STEM_CATEGORIES.METRONOME;
  }

  return STEM_CATEGORIES.OTHER;
}

export function StemUploader({ songId, songSlug, onUploadComplete }: StemUploaderProps) {
  const [stemFiles, setStemFiles] = useState<StemFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newStemFiles: StemFile[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      stemType: guessStemType(file.name),
      uploading: false,
      uploaded: false,
      error: null,
      duration: null,
    }));

    setStemFiles((prev) => [...prev, ...newStemFiles]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  const removeStemFile = useCallback((id: string) => {
    setStemFiles((prev) => prev.filter((stem) => stem.id !== id));
  }, []);

  const updateStemType = useCallback((id: string, stemType: StemCategory) => {
    setStemFiles((prev) =>
      prev.map((stem) => (stem.id === id ? { ...stem, stemType } : stem))
    );
  }, []);

  const uploadAllStems = useCallback(async () => {
    if (stemFiles.length === 0 || isUploading) return;

    setIsUploading(true);

    for (const stemFile of stemFiles) {
      if (stemFile.uploaded) continue;

      // Mark as uploading
      setStemFiles((prev) =>
        prev.map((s) => (s.id === stemFile.id ? { ...s, uploading: true, error: null } : s))
      );

      try {
        // Extract duration
        const duration = await extractAudioDuration(stemFile.file);

        // Upload file to server
        const formData = new FormData();
        formData.append('file', stemFile.file);
        formData.append('type', 'cue');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const { url } = await response.json();
        if (!url) {
          throw new Error('No URL received from upload');
        }

        // Create audio cue in database
        const title = deriveStemTitle(stemFile.file.name, stemFile.stemType);
        await createSongAudioCue(songId, {
          title,
          cue_url: url,
          description: `${stemFile.stemType} stem`,
          duration_seconds: duration ? Math.round(duration) : null,
        });

        // Mark as uploaded
        setStemFiles((prev) =>
          prev.map((s) =>
            s.id === stemFile.id ? { ...s, uploading: false, uploaded: true, duration } : s
          )
        );
      } catch (error) {
        console.error('Error uploading stem:', error);
        setStemFiles((prev) =>
          prev.map((s) =>
            s.id === stemFile.id
              ? { ...s, uploading: false, error: 'Upload failed. Please try again.' }
              : s
          )
        );
      }
    }

    setIsUploading(false);

    // Check if all files were uploaded successfully
    const allUploaded = stemFiles.every((s) => s.uploaded);
    if (allUploaded && onUploadComplete) {
      onUploadComplete();
    }
  }, [stemFiles, isUploading, songId, onUploadComplete]);

  const allUploaded = stemFiles.length > 0 && stemFiles.every((s) => s.uploaded);

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center transition-all
          ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full ${isDragging ? 'bg-blue-500/20' : 'bg-gray-800'}`}>
            <Upload className={`h-8 w-8 ${isDragging ? 'text-blue-400' : 'text-gray-400'}`} />
          </div>

          <div>
            <p className="text-lg font-medium mb-1">
              {isDragging ? 'Drop your stems here' : 'Drag & drop stem files here'}
            </p>
            <p className="text-sm text-gray-500">or</p>
          </div>

          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            disabled={isUploading}
          >
            Browse Files
          </Button>

          <p className="text-xs text-gray-500 max-w-md">
            Upload stems separated by Moises or similar tools. Supported formats: MP3, WAV, OGG, M4A
          </p>
        </div>
      </div>

      {/* File List */}
      {stemFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Stems to Upload ({stemFiles.length})
            </h3>
            {!allUploaded && (
              <Button
                onClick={uploadAllStems}
                disabled={isUploading}
                className="gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload All
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {stemFiles.map((stemFile) => {
              const colorClass = STEM_COLORS[stemFile.stemType];

              return (
                <Card key={stemFile.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Color Indicator */}
                      <div className={`w-3 h-12 rounded flex-shrink-0 ${colorClass}`} />

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Music2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <p className="font-medium truncate">{stemFile.file.name}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {(stemFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {stemFile.error && (
                          <p className="text-xs text-red-400 mt-1">{stemFile.error}</p>
                        )}
                      </div>

                      {/* Stem Type Selector */}
                      <select
                        value={stemFile.stemType}
                        onChange={(e) => updateStemType(stemFile.id, e.target.value as StemCategory)}
                        disabled={stemFile.uploading || stemFile.uploaded}
                        className="w-40 h-10 px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value={STEM_CATEGORIES.VOCALS}>Vocals</option>
                        <option value={STEM_CATEGORIES.GUITAR}>Guitar</option>
                        <option value={STEM_CATEGORIES.BASS}>Bass</option>
                        <option value={STEM_CATEGORIES.DRUMS}>Drums</option>
                        <option value={STEM_CATEGORIES.KEYS}>Keys</option>
                        <option value={STEM_CATEGORIES.METRONOME}>Metronome</option>
                        <option value={STEM_CATEGORIES.OTHER}>Other</option>
                      </select>

                      {/* Status Indicator */}
                      <div className="w-6 flex-shrink-0">
                        {stemFile.uploading && (
                          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                        )}
                        {stemFile.uploaded && (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                        {!stemFile.uploading && !stemFile.uploaded && (
                          <button
                            onClick={() => removeStemFile(stemFile.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Success Message */}
      {allUploaded && (
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-400">All stems uploaded successfully!</p>
              <p className="text-sm text-green-300/70 mt-1">
                You can now use the stem player to practice with these tracks.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
