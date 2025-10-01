'use client';

import { useState, useEffect, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { getSongWithStats, getSongLinks, deleteSong, createSongAudioCue, updateSongAudioCue, deleteSongAudioCue } from '@/actions/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EditSong } from '@/components/EditSong';
import { THEME } from '@/themes';
import { Calendar, Clock, Guitar, Hash, Mic, Music, Star, Tag, Users, Edit, ArrowLeft, Link as LinkIcon, FileText, Trash2, Upload, Pencil, Trash } from 'lucide-react';
import { FaSpotify, FaYoutube } from 'react-icons/fa';
import { SiYoutubemusic } from 'react-icons/si';
import { NavigationLink } from './NavigationButton';
import { useRouter } from 'next/navigation';

function getDifficultyColor(level: number) {
  const colors = ['text-green-600', 'text-blue-600', 'text-yellow-600', 'text-orange-600', 'text-red-600'];
  return colors[level - 1] || colors[0];
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatCueDuration(seconds?: number | null) {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) {
    return '';
  }
  const totalSeconds = Math.round(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

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
        reject(new Error('Kan audiobestandsduur niet bepalen'));
      };
    });

    return Number.isFinite(duration) ? duration : null;
  } catch (error) {
    console.error('Failed to read audio duration', error);
    return null;
  }
}

function deriveCueTitleFromFilename(filename: string) {
  const withoutExtension = filename.replace(/\.[^/.]+$/, '');
  return withoutExtension.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').replace(/^\w/, (match) => match.toUpperCase());
}

interface SongDetailsClientProps {
  song: any;
  stats: any;
  audioCues: any[];
  id: string;
}

export function SongDetailsClient({ song: initialSong, stats: initialStats, audioCues: initialAudioCues, id }: SongDetailsClientProps) {
  const router = useRouter();
  const [showEditForm, setShowEditForm] = useState(false);
  const [song, setSong] = useState(initialSong);
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [songLinks, setSongLinks] = useState<any[]>([]);
  const [audioCues, setAudioCues] = useState<any[]>(initialAudioCues || []);
  const [isUploadingCue, setIsUploadingCue] = useState(false);
  const [cueError, setCueError] = useState<string | null>(null);
  const [activeCueId, setActiveCueId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showStats, setShowStats] = useState(false);
  
  // Get the raw song data to access new fields
  const rawSong = song as any;
  
  useEffect(() => {
    loadSongLinks();
  }, [id]);
  
  const loadSongLinks = async () => {
    try {
      const links = await getSongLinks(id);
      setSongLinks(links || []);
    } catch (error) {
      console.error('Error loading song links:', error);
    }
  };

  const triggerCueUpload = () => {
    setCueError(null);
    fileInputRef.current?.click();
  };

  const handleCueFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setCueError(null);
    setIsUploadingCue(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'cue');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { url } = await response.json();
      if (!url) {
        throw new Error('Geen URL ontvangen voor audiobestand');
      }

      const duration = await extractAudioDuration(file);
      const newCue = await createSongAudioCue(id, {
        title: deriveCueTitleFromFilename(file.name),
        cue_url: url,
        duration_seconds: duration ? Math.round(duration) : null
      });

      setAudioCues((prev) => [...prev, newCue].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));
    } catch (error) {
      console.error('Error uploading cue', error);
      setCueError('Uploaden mislukt. Probeer een ander bestand of controleer je verbinding.');
    } finally {
      setIsUploadingCue(false);
      event.target.value = '';
    }
  };

  const handleRenameCue = async (cue: any) => {
    const newTitle = prompt('Naam van cue aanpassen', cue.title);
    if (!newTitle || newTitle.trim() === '' || newTitle.trim() === cue.title.trim()) {
      return;
    }

    try {
      const updated = await updateSongAudioCue(cue.id, { title: newTitle.trim() });
      setAudioCues((prev) => prev.map((item) => (item.id === cue.id ? updated : item)));
    } catch (error) {
      console.error('Error renaming cue', error);
      setCueError('Naam aanpassen mislukt.');
    }
  };

  const handleDeleteCue = async (cue: any) => {
    const confirmDelete = confirm(`Cue "${cue.title}" verwijderen?`);
    if (!confirmDelete) {
      return;
    }

    try {
      await deleteSongAudioCue(cue.id);
      setAudioCues((prev) => prev.filter((item) => item.id !== cue.id));
    } catch (error) {
      console.error('Error deleting cue', error);
      setCueError('Verwijderen mislukt.');
    }
  };

  const handleCuePlay = (cueId: string) => {
    setActiveCueId(cueId);
  };

  const handleCuePause = (cueId: string) => {
    setActiveCueId((current) => (current === cueId ? null : current));
  };

  const handleCueEnded = (cueId: string) => {
    setActiveCueId((current) => (current === cueId ? null : current));
  };
  
  const getLinkIcon = (type: string) => {
    switch (type) {
      case 'youtube': return <FaYoutube className="h-4 w-4 text-red-500" />;
      case 'youtube_music': return <SiYoutubemusic className="h-4 w-4 text-red-500" />;
      case 'spotify': return <FaSpotify className="h-4 w-4 text-green-500" />;
      default: return <LinkIcon className="h-4 w-4" />;
    }
  };

  const refreshSongData = async () => {
    setLoading(true);
    try {
      const result = await getSongWithStats(id);
      if (result) {
        setSong(result.song);
        setStats(result.stats);
        setAudioCues(result.audioCues || []);
      }
      await loadSongLinks();
    } catch (error) {
      console.error('Error refreshing song:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSong = async () => {
    const confirmMessage = `Weet je zeker dat je "${song.title}" wilt verwijderen?\n\nDit verwijdert:\n• Het nummer uit alle setlists\n• Alle song links\n• Cover art en audio bestanden\n• Alle statistieken en notities\n\nDeze actie kan niet ongedaan worden gemaakt.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    
    try {
      await deleteSong(id);
      
      // Navigate back to repertoire after successful deletion
      router.push('/practice/repertoire');
      
    } catch (error) {
      console.error('Error deleting song:', error);
      alert('Er is een fout opgetreden bij het verwijderen van het nummer');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {showEditForm && (
        <EditSong 
          song={rawSong} 
          masteryLevel={stats.mastery_level}
          onClose={() => setShowEditForm(false)} 
          onUpdate={refreshSongData}
        />
      )}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">{song.title}</h1>
            {song.artist && <p className="text-xl text-gray-400">{song.artist}</p>}
          </div>
          <div className="flex gap-2">
            <NavigationLink 
              href="/practice"
              className={`px-4 py-2 ${THEME.highlight} hover:bg-zinc-700 ${THEME.text} rounded-md font-medium transition-colors border ${THEME.border}`}
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Terug
            </NavigationLink>
            <Button
              onClick={() => setShowEditForm(true)}
              className={`inline-flex items-center gap-2 px-4 py-2 ${THEME.highlight} hover:bg-zinc-700 ${THEME.text} border ${THEME.border}`}
              variant="outline"
              disabled={loading}
            >
              <Edit className="h-4 w-4" />
              Bewerken
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-8">
          <NavigationLink 
            href={`/practice/lyrics/${song.slug}`} 
            className={`px-6 py-3 ${THEME.primaryBg} hover:${THEME.primaryBgDark} text-white rounded-md font-medium transition-colors`}
            icon={<Music className="h-4 w-4" />}
          >
            Bekijk Songtekst
          </NavigationLink>
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

          {/* Audio Cues */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Audio Cues</CardTitle>
                <CardDescription>Korte fragmenten voor intro&apos;s, breaks en eindes</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleCueFileChange} />
                <Button
                  onClick={triggerCueUpload}
                  disabled={isUploadingCue}
                  variant="ghost"
                  className="whitespace-nowrap rounded-full border border-white/10 bg-white/10 text-white transition-colors hover:bg-white/20 hover:text-white"
                >
                  {isUploadingCue ? (
                    'Bezig met uploaden...'
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Nieuwe cue
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {cueError && (
                <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {cueError}
                </div>
              )}
              {audioCues.length === 0 ? (
                <p className="text-sm text-gray-400">Nog geen audio referenties. Upload een opname van een break, intro of einde zodat iedereen weet hoe het moet klinken.</p>
              ) : (
                <div className="space-y-3">
                  {audioCues.map((cue) => (
                    <div
                      key={cue.id}
                      className={`rounded-xl border px-3 py-3 transition-colors ${
                        activeCueId === cue.id ? 'border-emerald-500/60 bg-emerald-500/10' : 'border-zinc-700 bg-zinc-900/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold leading-tight">{cue.title}</p>
                          {formatCueDuration(cue.duration_seconds) && (
                            <p className="text-xs text-gray-400">Lengte {formatCueDuration(cue.duration_seconds)}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleRenameCue(cue)} title="Naam aanpassen">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteCue(cue)} title="Verwijderen">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <audio
                        controls
                        src={cue.cue_url}
                        className="mt-3 w-full"
                        onPlay={() => handleCuePlay(cue.id)}
                        onPause={() => handleCuePause(cue.id)}
                        onEnded={() => handleCueEnded(cue.id)}
                      >
                        Je browser ondersteunt het audio element niet.
                      </audio>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Historie & Statistieken</CardTitle>
                <CardDescription>Alleen openen wanneer je het nodig hebt</CardDescription>
              </div>
              <Button variant="ghost" onClick={() => setShowStats((prev) => !prev)} className="w-full md:w-auto">
                {showStats ? 'Verberg details' : 'Toon details'}
              </Button>
            </CardHeader>
            {showStats && (
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Music className={`h-4 w-4 ${THEME.secondary}`} />
                    <span className="font-medium">Keer Gespeeld</span>
                    <span>{stats.times_played || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className={`h-4 w-4 ${THEME.secondary}`} />
                    <span className="font-medium">Keer Geoefend</span>
                    <span>{stats.times_practiced || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className={`h-4 w-4 ${THEME.secondary}`} />
                    <span className="font-medium">Beheersingsniveau</span>
                    <span className={getDifficultyColor(stats.mastery_level || 1)}>
                      {'★'.repeat(stats.mastery_level || 1)}{'☆'.repeat(5 - (stats.mastery_level || 1))}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {stats.last_practiced_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className={`h-4 w-4 ${THEME.secondary}`} />
                      <span className="font-medium">Laatst Geoefend</span>
                      <span>{new Date(stats.last_practiced_at).toLocaleDateString()}</span>
                    </div>
                  )}
                  {song.last_played_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className={`h-4 w-4 ${THEME.secondary}`} />
                      <span className="font-medium">Laatst Live Gespeeld</span>
                      <span>{new Date(song.last_played_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Tags - Hidden for now */}
          {/* {rawSong.tags && rawSong.tags.length > 0 && (
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
          )} */}

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

          {/* Tabs & Chords */}
          {rawSong.tabs_chords && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  <FileText className="inline h-5 w-5 mr-2" />
                  Tabs & Akkoorden
                </CardTitle>
                <CardDescription>Speelnotaties en akkoordenschema&apos;s</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap font-mono text-sm bg-zinc-800 p-4 rounded-md overflow-x-auto">
                  {rawSong.tabs_chords}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* External Links */}
          {songLinks.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  <LinkIcon className="inline h-5 w-5 mr-2" />
                  Externe Links
                </CardTitle>
                <CardDescription>Referenties en extra bronnen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {songLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-md border border-zinc-700 hover:bg-zinc-800 transition-colors"
                    >
                      {getLinkIcon(link.link_type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {link.title || link.link_type.charAt(0).toUpperCase() + link.link_type.slice(1).replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{link.url}</p>
                      </div>
                    </a>
                  ))}
                </div>
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

        {/* Danger Zone - Delete Song */}
        <div className="mt-12 pt-8 border-t border-zinc-800">
          <div className="bg-red-950/20 border border-red-900/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Gevaarlijke Zone</h3>
            <p className="text-gray-400 text-sm mb-4">
              Het verwijderen van dit nummer kan niet ongedaan worden gemaakt. 
              Het nummer wordt verwijderd uit alle setlists en alle bijbehorende gegevens gaan verloren.
            </p>
            <Button
              onClick={handleDeleteSong}
              disabled={isDeleting || loading}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white border-red-600"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Bezig met verwijderen...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Nummer Verwijderen
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
