'use client';

import { useState, useEffect } from 'react';
import { getSongWithStats, getSongLinks } from '@/actions/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EditSong } from '@/components/EditSong';
import { THEME } from '@/themes';
import { Calendar, Clock, Guitar, Hash, Mic, Music, Star, Tag, Users, Edit, ArrowLeft, Link as LinkIcon, FileText } from 'lucide-react';
import Link from 'next/link';
import { FaSpotify, FaYoutube } from 'react-icons/fa';
import { SiYoutubemusic } from 'react-icons/si';
import { NavigationLink } from './NavigationButton';

function getDifficultyColor(level: number) {
  const colors = ['text-green-600', 'text-blue-600', 'text-yellow-600', 'text-orange-600', 'text-red-600'];
  return colors[level - 1] || colors[0];
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

interface SongDetailsClientProps {
  song: any;
  stats: any;
  id: string;
}

export function SongDetailsClient({ song: initialSong, stats: initialStats, id }: SongDetailsClientProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [song, setSong] = useState(initialSong);
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(false);
  const [songLinks, setSongLinks] = useState<any[]>([]);
  
  // Get the raw song data to access new fields
  const rawSong = song as any;
  
  useEffect(() => {
    loadSongLinks();
  }, [id]);
  
  const loadSongLinks = async () => {
    try {
      const links = await getSongLinks(id);
      console.log('Loaded song links:', links);
      setSongLinks(links || []);
    } catch (error) {
      console.error('Error loading song links:', error);
    }
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
      }
      await loadSongLinks();
    } catch (error) {
      console.error('Error refreshing song:', error);
    } finally {
      setLoading(false);
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
            href={`/practice/lyrics/${id}`} 
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
      </div>
    </>
  );
}