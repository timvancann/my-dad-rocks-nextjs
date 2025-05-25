'use client';
import { updateSong, getSongLinks, createSongLink, updateSongLink, deleteSongLink } from '@/actions/supabase';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Hash, Music, X, Save, Tag, Plus, Minus, Link, Youtube, Disc3, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { THEME } from '@/themes';
import { SongType } from '@/lib/interface';
import { FaSpotify, FaYoutube } from 'react-icons/fa';
import { SiYoutubemusic } from 'react-icons/si';

interface EditSongProps {
  song: SongType & { key_signature?: string; tempo_bpm?: number; tags?: string[]; difficulty_level?: number; notes?: string; tabs_chords?: string };
  onClose: () => void;
  onUpdate?: () => void;
}

interface SongLink {
  id: string;
  link_type: 'youtube' | 'youtube_music' | 'spotify' | 'other';
  url: string;
  title?: string;
}

const KEY_SIGNATURES = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  'Cm', 'C#m', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bbm', 'Bm'
];

const COMMON_TAGS = [
  'Rock', 'Pop', 'Blues', 'Jazz', 'Folk', 'Country', 'Punk', 'Metal', 'Alternative', 'Indie',
  'Ballad', 'Upbeat', 'Slow', 'Fast', 'Easy', 'Hard', 'Acoustic', 'Electric', 'Crowd Favorite',
  'Energetic', 'Emotional', 'Guitar-driven', 'Bass-driven', 'Vocal Heavy', 'Instrumental'
];

export const EditSong = ({ song, onClose, onUpdate }: EditSongProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [songLinks, setSongLinks] = useState<SongLink[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [newLink, setNewLink] = useState({ type: 'youtube', url: '', title: '' });
  const [formData, setFormData] = useState({
    key_signature: song.key_signature || '',
    tempo_bpm: song.tempo_bpm || '',
    notes: song.notes || '',
    tabs_chords: song.tabs_chords || '',
    difficulty_level: song.difficulty_level || 1,
    tags: song.tags || []
  });
  
  // BPM Tap functionality
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [calculatedBPM, setCalculatedBPM] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Load song links on mount
  useEffect(() => {
    loadSongLinks();
  }, [song._id]);
  
  const loadSongLinks = async () => {
    try {
      const links = await getSongLinks(song._id);
      setSongLinks(links || []);
    } catch (error) {
      console.error('Error loading song links:', error);
    } finally {
      setIsLoadingLinks(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateSong(song._id, {
        key_signature: formData.key_signature || null,
        tempo_bpm: formData.tempo_bpm ? parseInt(formData.tempo_bpm.toString()) : null,
        notes: formData.notes || null,
        tabs_chords: formData.tabs_chords || null,
        difficulty_level: formData.difficulty_level,
        tags: formData.tags
      });
      
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error updating song:', error);
      alert('Er is een fout opgetreden bij het bijwerken van het nummer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'difficulty_level' ? parseInt(value) : value
    });
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleAddNewTag = () => {
    if (newTag.trim()) {
      addTag(newTag.trim());
      setNewTag('');
    }
  };

  const renderStars = (level: number) => {
    return '★'.repeat(level) + '☆'.repeat(5 - level);
  };
  
  const getLinkIcon = (type: string) => {
    switch (type) {
      case 'youtube': return <FaYoutube className="h-4 w-4 text-red-500" />;
      case 'youtube_music': return <SiYoutubemusic className="h-4 w-4 text-red-500" />;
      case 'spotify': return <FaSpotify className="h-4 w-4 text-green-500" />;
      default: return <Link className="h-4 w-4" />;
    }
  };
  
  const handleAddLink = async () => {
    if (!newLink.url) return;
    
    try {
      const link = await createSongLink(song._id, {
        link_type: newLink.type as any,
        url: newLink.url,
        title: newLink.title || undefined
      });
      setSongLinks([...songLinks, link]);
      setNewLink({ type: 'youtube', url: '', title: '' });
    } catch (error) {
      console.error('Error adding link:', error);
    }
  };
  
  const handleDeleteLink = async (linkId: string) => {
    try {
      await deleteSongLink(linkId);
      setSongLinks(songLinks.filter(l => l.id !== linkId));
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  const handleTap = () => {
    const now = Date.now();
    setIsAnimating(true);
    
    // Reset animation after a short time
    setTimeout(() => setIsAnimating(false), 150);
    
    setTapTimes(prevTimes => {
      const newTimes = [...prevTimes, now];
      
      // Keep only the last 8 taps for more stable calculation
      const recentTimes = newTimes.slice(-8);
      
      if (recentTimes.length >= 2) {
        // Calculate intervals between taps
        const intervals = [];
        for (let i = 1; i < recentTimes.length; i++) {
          intervals.push(recentTimes[i] - recentTimes[i - 1]);
        }
        
        // Calculate average interval from the last 4 intervals for stability
        const recentIntervals = intervals.slice(-4);
        const avgInterval = recentIntervals.reduce((a, b) => a + b) / recentIntervals.length;
        
        // Convert to BPM (60000ms = 1 minute)
        const bpm = Math.round(60000 / avgInterval);
        
        // Only update if BPM is within reasonable range
        if (bpm >= 40 && bpm <= 300) {
          setCalculatedBPM(bpm);
        }
      }
      
      return recentTimes;
    });
  };
  
  const resetTap = () => {
    setTapTimes([]);
    setCalculatedBPM(null);
  };
  
  const useTappedBPM = () => {
    if (calculatedBPM) {
      setFormData({
        ...formData,
        tempo_bpm: calculatedBPM.toString()
      });
    }
  };

  // Add keyboard support for spacebar tap
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        handleTap();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg ${THEME.highlight} border ${THEME.border} shadow-2xl`}>
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900">
          <h2 className="text-xl font-bold">Nummer Bewerken</h2>
          <button
            onClick={onClose}
            className="rounded-full bg-zinc-800/70 p-1.5 hover:bg-zinc-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold">{song.title}</h3>
            {song.artist && <p className="text-gray-400">{song.artist}</p>}
          </div>

          {/* Key and Tempo Input */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="key_signature">
                <Hash className="inline h-4 w-4 mr-1" />
                Toonsoort
              </Label>
              <select
                id="key_signature"
                name="key_signature"
                value={formData.key_signature}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-zinc-800 text-white rounded-md border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                <option value="">Selecteer toonsoort</option>
                {KEY_SIGNATURES.map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tempo_bpm">
                <Music className="inline h-4 w-4 mr-1" />
                Tempo (BPM)
              </Label>
              <Input
                id="tempo_bpm"
                name="tempo_bpm"
                type="number"
                min="40"
                max="300"
                value={formData.tempo_bpm}
                onChange={handleChange}
                placeholder="b.v. 120"
                className="bg-zinc-800 text-white border-zinc-600 focus:border-rose-400 focus:ring-rose-400"
              />
            </div>
          </div>

          {/* BPM Tap Feature - Full Width */}
          <div className="space-y-2">
            <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-600">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-300">BPM Tap</span>
                <div className="flex gap-2">
                  {calculatedBPM && (
                    <Button
                      type="button"
                      onClick={useTappedBPM}
                      size="sm"
                      className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-3 py-1"
                    >
                      Gebruik {calculatedBPM}
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={resetTap}
                    size="sm"
                    variant="outline"
                    className="text-xs px-3 py-1 bg-zinc-700 hover:bg-zinc-600 border-zinc-600"
                  >
                    Reset
                  </Button>
                </div>
              </div>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleTap}
                  className={`w-24 h-24 mx-auto rounded-full border-2 border-rose-400 bg-zinc-700 hover:bg-zinc-600 active:bg-rose-600 transition-all duration-75 flex items-center justify-center text-rose-400 hover:text-rose-300 active:text-white ${
                    isAnimating ? 'scale-110 bg-rose-600 text-white border-rose-300' : ''
                  }`}
                >
                  <Music className="h-7 w-7" />
                </button>
                
                <div className="mt-4 space-y-1">
                  {calculatedBPM ? (
                    <div className="text-xl font-bold text-rose-400">
                      {calculatedBPM} BPM
                    </div>
                  ) : (
                    <div className="text-base text-gray-400">
                      Tap in ritme
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-500">
                    {tapTimes.length > 0 ? (
                      `${tapTimes.length} tap${tapTimes.length !== 1 ? 's' : ''}`
                    ) : (
                      <>
                        Start met tikken op de beat<br />
                        <span className="text-gray-600">of gebruik de spatiebalk</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label htmlFor="difficulty_level">Beheersingsniveau</Label>
            <div className="flex items-center gap-4">
              <select
                id="difficulty_level"
                name="difficulty_level"
                value={formData.difficulty_level}
                onChange={handleChange}
                className="px-3 py-2 bg-zinc-800 text-white rounded-md border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                {[1, 2, 3, 4, 5].map(level => (
                  <option key={level} value={level}>
                    {level} - {renderStars(level)}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-400">
                {renderStars(formData.difficulty_level)}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <Label>
              <Tag className="inline h-4 w-4 mr-1" />
              Tags
            </Label>
            
            {/* Current Tags */}
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            {/* Add New Tag */}
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Nieuwe tag toevoegen..."
                className="flex-1 bg-zinc-800 text-white border-zinc-600 focus:border-rose-400 focus:ring-rose-400"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewTag())}
              />
              <Button
                type="button"
                onClick={handleAddNewTag}
                className="px-3 bg-zinc-700 hover:bg-zinc-600"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Common Tags */}
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Veel gebruikte tags:</p>
              <div className="flex flex-wrap gap-1">
                {COMMON_TAGS.filter(tag => !formData.tags.includes(tag)).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 rounded-md transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notities</Label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-zinc-800 text-white rounded-md border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-rose-400"
              rows={4}
              placeholder="Notities over het nummer, speelstijl, moeilijke passages, etc..."
            />
          </div>

          {/* Tabs/Chords */}
          <div className="space-y-2">
            <Label htmlFor="tabs_chords">
              <FileText className="inline h-4 w-4 mr-1" />
              Tabs & Akkoorden
            </Label>
            <textarea
              id="tabs_chords"
              name="tabs_chords"
              value={formData.tabs_chords}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-zinc-800 text-white rounded-md border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-rose-400 font-mono text-sm"
              rows={8}
              placeholder="Voeg akkoorden, tabs of speelnotaties toe..."
            />
          </div>

          {/* External Links */}
          <div className="space-y-4">
            <Label>
              <Link className="inline h-4 w-4 mr-1" />
              Externe Links
            </Label>
            
            {/* Existing Links */}
            {!isLoadingLinks && (
              <div className="space-y-2">
                {songLinks.map((link) => (
                  <div key={link.id} className="flex items-center gap-2 p-2 bg-zinc-800 rounded-md">
                    {getLinkIcon(link.link_type)}
                    <div className="flex-1">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" 
                         className="text-sm text-blue-400 hover:text-blue-300">
                        {link.title || link.url}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteLink(link.id)}
                      className="p-1 hover:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add New Link */}
            <div className="space-y-2 p-3 bg-zinc-800 rounded-md">
              <div className="flex gap-2">
                <select
                  value={newLink.type}
                  onChange={(e) => setNewLink({...newLink, type: e.target.value})}
                  className="px-3 py-2 bg-zinc-700 text-white rounded-md border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <option value="youtube">YouTube</option>
                  <option value="youtube_music">YouTube Music</option>
                  <option value="spotify">Spotify</option>
                  <option value="other">Anders</option>
                </select>
                <Input
                  value={newLink.url}
                  onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                  placeholder="URL"
                  className="flex-1 bg-zinc-700 text-white border-zinc-600"
                />
              </div>
              <div className="flex gap-2">
                <Input
                  value={newLink.title}
                  onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                  placeholder="Titel (optioneel)"
                  className="flex-1 bg-zinc-700 text-white border-zinc-600"
                />
                <Button
                  type="button"
                  onClick={handleAddLink}
                  disabled={!newLink.url}
                  className="px-4 bg-zinc-700 hover:bg-zinc-600"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className={`flex-1 ${THEME.highlight} hover:bg-zinc-700 ${THEME.text} border-zinc-800`}
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 ${THEME.primaryBg} hover:${THEME.primaryBgDark} text-white`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Bezig met opslaan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Wijzigingen Opslaan
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};