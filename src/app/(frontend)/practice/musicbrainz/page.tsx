'use client';
import { CoverArtArchiveApi, MusicBrainzApi } from 'musicbrainz-api';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { SongProposalList } from '@/components/SongProposal';
import { MusicBrainzTree, MusicBrainzTreeBuilder, MusicBrainzTreeNode } from '@/lib/musicbrainz-tree';
import { TreeView } from '@/components/SongProposal/TreeView';

const config = {
  botAccount: {
    username: 'timvancann',
    password: 'AYG4pxr1qck.htj!dch'
  },
  baseUrl: 'https://musicbrainz.org',
  appName: 'my-dad-rocks',
  appVersion: '0.1.0',
  appMail: 'timvancann@gmail.com',
  disableRateLimiting: false
};

export interface ProposedSong {
  mbid: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  artwork: string;
  notes: string;
  dualGuitar: boolean;
  dualVocal: boolean;
}

export default function MusicBrainzSearchPage() {
  const mbApi = new MusicBrainzApi(config);
  const treeBuilder = useMemo(() => new MusicBrainzTreeBuilder(mbApi), [mbApi]);

  // Search inputs
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchType, setSearchType] = useState<'artist' | 'album' | 'song'>('artist');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  
  // Tree state
  const [tree, setTree] = useState<MusicBrainzTree>({ nodes: {}, rootIds: [] });
  const [selectedNodeId, setSelectedNodeId] = useState<string>('');
  const [expandingNodes, setExpandingNodes] = useState<Record<string, boolean>>({});
  const [coverArtMap, setCoverArtMap] = useState<Record<string, string>>({});

  // Proposal form
  const [notes, setNotes] = useState<string>('');
  const [dualGuitar, setDualGuitar] = useState<boolean>(false);
  const [dualVocal, setDualVocal] = useState<boolean>(false);
  const [proposedSongs, setProposedSongs] = useState<ProposedSong[]>([]);
  
  // Load saved proposals from localStorage on mount
  useEffect(() => {
    const savedSongs = localStorage.getItem('proposedSongs');
    if (savedSongs) {
      try {
        setProposedSongs(JSON.parse(savedSongs));
      } catch (e) {
        console.error('Failed to parse saved songs', e);
      }
    }
  }, []);
  
  // Save proposals to localStorage when updated
  useEffect(() => {
    if (proposedSongs.length > 0) {
      localStorage.setItem('proposedSongs', JSON.stringify(proposedSongs));
    }
  }, [proposedSongs]);

  // Get cover art for an album
  const fetchCoverArt = useCallback(async (albumNodeId: string) => {
    const node = tree.nodes[albumNodeId];
    if (node?.type !== 'album') return;
    
    const releaseId = node.details.id;
    if (!releaseId) return;
    
    const coverUrl = `/api/proxy/cover-art?releaseId=${releaseId}`;
    
    // Update the cover art map
    setCoverArtMap(prev => ({
      ...prev,
      [albumNodeId]: coverUrl
    }));
    
    // Update the tree node
    treeBuilder.setCoverArt(albumNodeId, coverUrl);
    setTree({ ...treeBuilder.data });
  }, [tree, treeBuilder]);

  // Search for artists, albums, or songs
  const search = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search term');
      return;
    }

    setIsSearching(true);
    treeBuilder.clear();
    setTree({ nodes: {}, rootIds: [] });
    setSelectedNodeId('');
    setCoverArtMap({});
    setExpandingNodes({});

    try {
      let nodeIds: string[] = [];
      
      if (searchType === 'artist') {
        nodeIds = await treeBuilder.searchArtists(searchQuery);
      } else if (searchType === 'album') {
        // Use the dedicated album search method
        nodeIds = await treeBuilder.searchAlbums(searchQuery);
        
        // Fetch cover art for all albums
        nodeIds.forEach(albumId => {
          fetchCoverArt(albumId);
        });
      } else if (searchType === 'song') {
        nodeIds = await treeBuilder.searchSongs(searchQuery);
        
        // Fetch cover art for any albums we found
        Object.values(treeBuilder.data.nodes)
          .filter(node => node.type === 'album')
          .forEach(node => {
            fetchCoverArt(node.id);
          });
      }
      
      setTree({ ...treeBuilder.data });
      
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search MusicBrainz. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle node selection in tree
  const handleSelectNode = async (nodeId: string) => {
    setSelectedNodeId(nodeId);
    const node = tree.nodes[nodeId];
    
    if (!node) return;
    
    if (node.type === 'artist' && node.children.length === 0) {
      // Load albums for this artist
      setExpandingNodes(prev => ({ ...prev, [nodeId]: true }));
      
      try {
        await treeBuilder.getAlbumsByArtist(nodeId);
        setTree({ ...treeBuilder.data });
        
        // Fetch cover art for all albums
        treeBuilder.data.nodes[nodeId].children.forEach(albumId => {
          fetchCoverArt(albumId);
        });
      } catch (error) {
        console.error(`Error loading albums for ${nodeId}:`, error);
      } finally {
        setExpandingNodes(prev => ({ ...prev, [nodeId]: false }));
      }
    } else if (node.type === 'album' && node.children.length === 0) {
      // Load songs for this album
      setExpandingNodes(prev => ({ ...prev, [nodeId]: true }));
      
      try {
        await treeBuilder.getSongsByAlbum(nodeId);
        setTree({ ...treeBuilder.data });
      } catch (error) {
        console.error(`Error loading songs for ${nodeId}:`, error);
      } finally {
        setExpandingNodes(prev => ({ ...prev, [nodeId]: false }));
      }
    } else if (node.type === 'album' && node.children.length > 0) {
      // If album has children already, just make sure it's expanded in the UI
      // We'll handle this in the TreeView component
    }
  };

  // Handle proposing a song
  const handleProposeSong = () => {
    const node = tree.nodes[selectedNodeId];
    
    if (!node || node.type !== 'song') {
      alert('Please select a song first');
      return;
    }
    
    // Get artist and album info
    const artistNode = node.parent && tree.nodes[tree.nodes[node.parent]?.parent || ''];
    const albumNode = node.parent && tree.nodes[node.parent];
    
    if (!artistNode || artistNode.type !== 'artist' || !albumNode || albumNode.type !== 'album') {
      alert('Missing artist or album information');
      return;
    }
    
    const newProposal: ProposedSong = {
      mbid: node.details.id,
      title: node.name,
      artist: artistNode.name,
      album: albumNode.name,
      duration: node.details.length ? Math.floor(node.details.length / 1000) : 0,
      artwork: albumNode.coverArt || '',
      notes: notes,
      dualGuitar: dualGuitar,
      dualVocal: dualVocal
    };

    // Check if song already exists in proposed songs
    const songExists = proposedSongs.some(song => song.mbid === newProposal.mbid);
    
    if (!songExists) {
      setProposedSongs([...proposedSongs, newProposal]);
      
      // Reset form
      setNotes('');
      setDualGuitar(false);
      setDualVocal(false);
    } else {
      alert('This song is already in your proposals');
    }
  };

  // Get details of the selected node
  const getSelectedNodeDetails = () => {
    const node = tree.nodes[selectedNodeId];
    if (!node) return null;
    
    if (node.type === 'song') {
      const albumNode = node.parent ? tree.nodes[node.parent] : null;
      const artistNode = albumNode?.parent ? tree.nodes[albumNode.parent] : null;
      
      return {
        song: node,
        album: albumNode,
        artist: artistNode
      };
    } else if (node.type === 'album') {
      const artistNode = node.parent ? tree.nodes[node.parent] : null;
      
      return {
        album: node,
        artist: artistNode
      };
    } else if (node.type === 'artist') {
      return {
        artist: node
      };
    }
    
    return null;
  };

  const formatDuration = (ms: number) => {
    if (!ms) return '--:--';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const selectedDetails = getSelectedNodeDetails();

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <h1 className="mb-8 text-3xl font-bold">Song Proposal Tool</h1>
      
      {/* Search Section */}
      <div className="mb-8 rounded-lg bg-zinc-900 p-6 border border-zinc-800">
        <h2 className="mb-4 text-xl font-semibold">Search MusicBrainz</h2>
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <Label htmlFor="searchQuery" className="mb-2 block">Search Term</Label>
            <Input 
              id="searchQuery" 
              placeholder="Enter artist, album, or song" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && search()}
            />
          </div>
          
          <div className="w-full md:w-48">
            <Label htmlFor="searchType" className="mb-2 block">Search For</Label>
            <div className="flex rounded-md border border-zinc-700 bg-zinc-800">
              <button 
                className={`flex-1 rounded-l-md px-4 py-2 ${searchType === 'artist' ? 'bg-blue-800 text-white' : 'text-zinc-400'}`}
                onClick={() => setSearchType('artist')}
              >
                Artist
              </button>
              <button 
                className={`flex-1 border-x border-zinc-700 px-4 py-2 ${searchType === 'album' ? 'bg-blue-800 text-white' : 'text-zinc-400'}`}
                onClick={() => setSearchType('album')}
              >
                Album
              </button>
              <button 
                className={`flex-1 rounded-r-md px-4 py-2 ${searchType === 'song' ? 'bg-blue-800 text-white' : 'text-zinc-400'}`}
                onClick={() => setSearchType('song')}
              >
                Song
              </button>
            </div>
          </div>
          
          <div className="w-full md:w-36">
            <Label className="mb-2 block opacity-0">Search</Label>
            <Button 
              className="w-full" 
              onClick={search} 
              disabled={isSearching}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-zinc-500">
          <details>
            <summary className="cursor-pointer font-medium mb-1 hover:text-zinc-300">Search tips</summary>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Click on an artist to load their albums</li>
              <li>Click on an album to load its songs</li>
              <li>Use quotes for exact matches, e.g., &quot;Black Sabbath&quot;</li>
              <li>For artists with common names, try adding a song or album title to narrow results</li>
              <li>Filter results in the tree view to find specific items</li>
              <li>Try different search types (artist/album/song) for better results</li>
            </ul>
          </details>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        {/* Tree View Column */}
        <div className="rounded-lg bg-zinc-900 p-4 md:col-span-1 border border-zinc-800">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-medium">Search Results</h3>
              {tree.rootIds.length > 0 && (
                <span className="text-xs text-zinc-500">
                  {tree.rootIds.length} {searchType === 'artist' ? 'artists' : searchType === 'album' ? 'albums' : 'songs'} found
                </span>
              )}
            </div>
            
            {isSearching ? (
              <div className="py-12 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em]"></div>
                <p className="mt-4 text-zinc-400">Searching {searchType}s...</p>
              </div>
            ) : (
              <TreeView 
                tree={tree} 
                onSelectNode={handleSelectNode} 
                selectedNodeId={selectedNodeId}
                isLoading={expandingNodes}
                coverArtMap={coverArtMap}
              />
            )}
          </div>
        </div>
        
        {/* Details Column */}
        <div className="rounded-lg bg-zinc-900 p-4 md:col-span-2 border border-zinc-800">
          <h3 className="mb-3 text-lg font-medium">Details</h3>
          
          {!selectedNodeId && (
            <div className="rounded-lg border border-dashed border-zinc-700 p-8 text-center">
              <p className="text-zinc-400">Select an item from the tree to view details</p>
              <p className="mt-2 text-sm text-zinc-500">
                {tree.rootIds.length > 0 ? 
                  'Click on artists to see their albums, or albums to see their songs' :
                  'Use the search box above to find music'
                }
              </p>
            </div>
          )}
          
          {selectedDetails && (
            <div>
              {/* Artist Info */}
              {selectedDetails.artist && (
                <div className="mb-4 rounded-md bg-zinc-800 p-4">
                  <h4 className="text-lg font-semibold">{selectedDetails.artist.name}</h4>
                  {selectedDetails.artist.details.disambiguation && (
                    <p className="mt-1 text-sm text-zinc-400">{selectedDetails.artist.details.disambiguation}</p>
                  )}
                  <div className="mt-2">
                    <a 
                      href={`https://musicbrainz.org/artist/${selectedDetails.artist.details.id}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:underline"
                    >
                      View on MusicBrainz
                    </a>
                  </div>
                </div>
              )}
              
              {/* Album Info */}
              {selectedDetails.album && (
                <div className="mb-4 rounded-md bg-zinc-800 p-4">
                  <div className="flex items-start gap-4">
                    {coverArtMap[selectedDetails.album.id] ? (
                      <Image 
                        src={coverArtMap[selectedDetails.album.id]} 
                        alt={selectedDetails.album.name} 
                        width={100}
                        height={100}
                        className="rounded object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-[100px] w-[100px] items-center justify-center rounded bg-zinc-700 text-zinc-500">
                        No Cover
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-lg font-semibold">{selectedDetails.album.name}</h4>
                      {selectedDetails.album.details.date && (
                        <p className="text-sm text-zinc-400">{selectedDetails.album.details.date}</p>
                      )}
                      {selectedDetails.artist && (
                        <p className="text-sm text-zinc-300">by {selectedDetails.artist.name}</p>
                      )}
                      <div className="mt-2">
                        <a 
                          href={`https://musicbrainz.org/release/${selectedDetails.album.details.id}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:underline"
                        >
                          View on MusicBrainz
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Song Info */}
              {selectedDetails.song && (
                <div>
                  <div className="mb-4 rounded-md bg-zinc-800 p-4">
                    <h4 className="text-lg font-semibold">{selectedDetails.song.name}</h4>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                      {selectedDetails.artist && (
                        <p className="text-sm text-zinc-300">
                          by {selectedDetails.artist.name}
                        </p>
                      )}
                      {selectedDetails.album && (
                        <p className="text-sm text-zinc-300">
                          from {selectedDetails.album.name}
                        </p>
                      )}
                      {selectedDetails.song.details.length && (
                        <p className="text-sm text-zinc-400">
                          {formatDuration(selectedDetails.song.details.length)}
                        </p>
                      )}
                    </div>
                    <div className="mt-2">
                      <a 
                        href={`https://musicbrainz.org/recording/${selectedDetails.song.details.id}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline"
                      >
                        View on MusicBrainz
                      </a>
                    </div>
                  </div>
                  
                  {/* Proposal Form */}
                  <div className="rounded-md bg-zinc-800 p-4">
                    <h4 className="mb-3 text-lg font-semibold">Propose This Song</h4>
                    
                    <div className="mb-4 space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Input 
                        id="notes" 
                        placeholder="Any notes about this song..." 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                    
                    <div className="mb-4 flex gap-6">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="dualGuitar" 
                          checked={dualGuitar} 
                          onChange={(e) => setDualGuitar(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="dualGuitar">Dual Guitar</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="dualVocal" 
                          checked={dualVocal} 
                          onChange={(e) => setDualVocal(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="dualVocal">Dual Vocal</Label>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={handleProposeSong}
                    >
                      Propose Song
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Proposed Songs List */}
      <div className="mt-8 rounded-lg bg-zinc-900 p-6 border border-zinc-800">
        <SongProposalList 
          proposedSongs={proposedSongs}
          onRemove={(index) => {
            const newSongs = [...proposedSongs];
            newSongs.splice(index, 1);
            setProposedSongs(newSongs);
            
            if (newSongs.length === 0) {
              localStorage.removeItem('proposedSongs');
            }
          }}
        />
      </div>
    </div>
  );
}