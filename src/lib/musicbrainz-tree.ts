import { IArtistMatch, IRecordingMatch, IReleaseMatch, MusicBrainzApi } from 'musicbrainz-api';

export interface MusicBrainzTreeNode {
  id: string;
  name: string;
  type: 'artist' | 'album' | 'song';
  parent?: string;
  children: string[];
  details: any;
  coverArt?: string;
}

export interface MusicBrainzTree {
  nodes: Record<string, MusicBrainzTreeNode>;
  rootIds: string[];
}

// Artists
export interface ArtistNode extends MusicBrainzTreeNode {
  type: 'artist';
  details: IArtistMatch;
}

// Albums
export interface AlbumNode extends MusicBrainzTreeNode {
  type: 'album';
  details: IReleaseMatch;
  artistId: string;
  year?: string;
}

// Songs
export interface SongNode extends MusicBrainzTreeNode {
  type: 'song';
  details: IRecordingMatch;
  albumId: string;
  artistId: string;
  duration: number;
}

export class MusicBrainzTreeBuilder {
  private api: MusicBrainzApi;
  private tree: MusicBrainzTree = {
    nodes: {},
    rootIds: []
  };

  constructor(api: MusicBrainzApi) {
    this.api = api;
  }

  get data(): MusicBrainzTree {
    return this.tree;
  }

  /**
   * Searches for artists and adds them to the tree
   */
  async searchArtists(query: string): Promise<string[]> {
    if (!query.trim()) return [];

    try {
      // Search for artists with the given query
      const results = await this.api.search('artist', { query: `"${query}"`, limit: 20 });
      const artists = results.artists.slice(0, 16);

      // Add artists to tree
      const artistIds: string[] = [];
      artists.forEach(artist => {
        const nodeId = `artist-${artist.id}`;
        
        // Only add if not already in tree
        if (!this.tree.nodes[nodeId]) {
          this.tree.nodes[nodeId] = {
            id: nodeId,
            name: artist.name,
            type: 'artist',
            children: [],
            details: artist
          };
          this.tree.rootIds.push(nodeId);
          artistIds.push(nodeId);
        } else {
          artistIds.push(nodeId);
        }
      });

      return artistIds;
    } catch (error) {
      console.error('Error searching artists:', error);
      return [];
    }
  }

  /**
   * Fetches albums for a specific artist and adds them to the tree
   */
  async getAlbumsByArtist(artistNodeId: string): Promise<string[]> {
    const artistNode = this.tree.nodes[artistNodeId] as ArtistNode;
    if (!artistNode || artistNode.type !== 'artist') return [];

    try {
      // Search for albums by this artist
      const artistId = artistNode.details.id;
      const query = `arid:${artistId}`;
      const results = await this.api.search('release', { query, limit: 100 });
      const albums = results.releases.slice(0, 30);

      // Group albums by title to handle duplicates
      const uniqueAlbums = this.deduplicateReleases(albums);

      // Add albums to tree
      const albumIds: string[] = [];
      uniqueAlbums.forEach(album => {
        const nodeId = `album-${album.id}`;
        
        // Only add if not already in tree
        if (!this.tree.nodes[nodeId]) {
          this.tree.nodes[nodeId] = {
            id: nodeId,
            name: album.title,
            type: 'album',
            parent: artistNodeId,
            children: [],
            details: album,
            artistId: artistNodeId,
            year: album.date ? album.date.split('-')[0] : undefined
          };
          
          // Add as child to artist
          artistNode.children.push(nodeId);
          albumIds.push(nodeId);
        } else {
          // Make sure this album is connected to the artist
          if (!artistNode.children.includes(nodeId)) {
            artistNode.children.push(nodeId);
          }
          albumIds.push(nodeId);
        }
      });

      return albumIds;
    } catch (error) {
      console.error(`Error fetching albums for artist ${artistNodeId}:`, error);
      return [];
    }
  }

  /**
   * Fetches songs for a specific album and adds them to the tree
   */
  async getSongsByAlbum(albumNodeId: string): Promise<string[]> {
    const albumNode = this.tree.nodes[albumNodeId] as AlbumNode;
    if (!albumNode || albumNode.type !== 'album') return [];

    try {
      // Get detailed release information with recordings included
      const releaseId = albumNode.details.id;
      const release = await this.api.lookupEntity('release', releaseId, {
        inc: 'recordings'
      });

      if (!release.media || release.media.length === 0) {
        return [];
      }

      // Process all tracks from all media
      const songIds: string[] = [];
      
      release.media.forEach(medium => {
        if (!medium.tracks) return;
        
        medium.tracks.forEach(track => {
          const recording = track.recording;
          if (!recording) return;
          
          const nodeId = `song-${recording.id}`;
          
          // Only add if not already in tree
          if (!this.tree.nodes[nodeId]) {
            const artistNodeId = albumNode.artistId;
            
            this.tree.nodes[nodeId] = {
              id: nodeId,
              name: recording.title,
              type: 'song',
              parent: albumNodeId,
              children: [],
              details: recording,
              albumId: albumNodeId,
              artistId: artistNodeId,
              duration: recording.length ? Math.floor(recording.length / 1000) : 0
            };
            
            // Add as child to album
            albumNode.children.push(nodeId);
            songIds.push(nodeId);
          } else if (!albumNode.children.includes(nodeId)) {
            // Make sure this song is connected to the album
            albumNode.children.push(nodeId);
            songIds.push(nodeId);
          } else {
            songIds.push(nodeId);
          }
        });
      });

      return songIds;
    } catch (error) {
      console.error(`Error fetching songs for album ${albumNodeId}:`, error);
      return [];
    }
  }

  /**
   * Searches for songs directly and adds them to the tree
   * This is less structured but useful for direct song searches
   */
  async searchSongs(query: string): Promise<string[]> {
    if (!query.trim()) return [];

    try {
      // Search for recordings with the given query
      const results = await this.api.search('recording', { query: `"${query}"`, limit: 50 });
      const songs = results.recordings.slice(0, 20);

      // Add songs to tree
      const songIds: string[] = [];
      
      for (const song of songs) {
        const nodeId = `song-${song.id}`;
        
        // Only add if not already in tree
        if (!this.tree.nodes[nodeId]) {
          // Try to find artist info
          let artistNode: ArtistNode | undefined;
          let artistNodeId = '';
          
          if (song['artist-credit'] && song['artist-credit'].length > 0) {
            const artistCredit = song['artist-credit'][0];
            if (artistCredit.artist) {
              // Check if we already have this artist
              artistNodeId = `artist-${artistCredit.artist.id}`;
              
              if (!this.tree.nodes[artistNodeId]) {
                // Add artist to tree
                this.tree.nodes[artistNodeId] = {
                  id: artistNodeId,
                  name: artistCredit.artist.name,
                  type: 'artist',
                  children: [],
                  details: artistCredit.artist
                };
                this.tree.rootIds.push(artistNodeId);
              }
              
              artistNode = this.tree.nodes[artistNodeId] as ArtistNode;
            }
          }
          
          // Find or create a placeholder album if needed
          let albumNodeId = '';
          if (song.releases && song.releases.length > 0) {
            // Use the first release as the album
            const release = song.releases[0];
            albumNodeId = `album-${release.id}`;
            
            if (!this.tree.nodes[albumNodeId]) {
              // Add album to tree
              this.tree.nodes[albumNodeId] = {
                id: albumNodeId,
                name: release.title || 'Unknown Album',
                type: 'album',
                parent: artistNodeId,
                children: [],
                details: release,
                artistId: artistNodeId
              };
              
              // Connect to artist if we have one
              if (artistNode) {
                artistNode.children.push(albumNodeId);
              } else {
                // If no artist, make it a root
                this.tree.rootIds.push(albumNodeId);
              }
            }
          } else if (artistNode) {
            // Create a placeholder album called "Singles" for this artist
            albumNodeId = `album-singles-${artistNode.details.id}`;
            
            if (!this.tree.nodes[albumNodeId]) {
              this.tree.nodes[albumNodeId] = {
                id: albumNodeId,
                name: 'Singles',
                type: 'album',
                parent: artistNodeId,
                children: [],
                details: { title: 'Singles', id: `singles-${artistNode.details.id}` },
                artistId: artistNodeId
              };
              
              artistNode.children.push(albumNodeId);
            }
          } else {
            // Create an "Unknown" album and artist as fallback
            const unknownArtistId = 'artist-unknown';
            if (!this.tree.nodes[unknownArtistId]) {
              this.tree.nodes[unknownArtistId] = {
                id: unknownArtistId,
                name: 'Unknown Artist',
                type: 'artist',
                children: [],
                details: { name: 'Unknown Artist', id: 'unknown' }
              };
              this.tree.rootIds.push(unknownArtistId);
            }
            
            albumNodeId = 'album-unknown';
            if (!this.tree.nodes[albumNodeId]) {
              this.tree.nodes[albumNodeId] = {
                id: albumNodeId,
                name: 'Unknown Album',
                type: 'album',
                parent: unknownArtistId,
                children: [],
                details: { title: 'Unknown Album', id: 'unknown' },
                artistId: unknownArtistId
              };
              
              (this.tree.nodes[unknownArtistId] as ArtistNode).children.push(albumNodeId);
            }
            
            artistNodeId = unknownArtistId;
          }
          
          // Add song node
          this.tree.nodes[nodeId] = {
            id: nodeId,
            name: song.title,
            type: 'song',
            parent: albumNodeId,
            children: [],
            details: song,
            albumId: albumNodeId,
            artistId: artistNodeId,
            duration: song.length ? Math.floor(song.length / 1000) : 0
          };
          
          // Add as child to album
          if (albumNodeId && this.tree.nodes[albumNodeId]) {
            (this.tree.nodes[albumNodeId] as AlbumNode).children.push(nodeId);
          }
          
          songIds.push(nodeId);
        } else {
          songIds.push(nodeId);
        }
      }

      return songIds;
    } catch (error) {
      console.error('Error searching songs:', error);
      return [];
    }
  }

  /**
   * Sets cover art URL for an album node
   */
  setCoverArt(albumNodeId: string, coverArtUrl: string): void {
    const node = this.tree.nodes[albumNodeId];
    if (node && node.type === 'album') {
      node.coverArt = coverArtUrl;
    }
  }

  /**
   * Searches for albums directly and adds them to the tree
   */
  async searchAlbums(query: string): Promise<string[]> {
    if (!query.trim()) return [];

    try {
      // Search for releases with the given query
      const results = await this.api.search('release', { query: `"${query}"`, limit: 50 });
      const albums = results.releases.slice(0, 20);
      
      // Add albums to tree
      const albumIds: string[] = [];
      
      for (const album of albums) {
        const nodeId = `album-${album.id}`;
        
        // Only add if not already in tree
        if (!this.tree.nodes[nodeId]) {
          // Try to find artist info
          let artistNode: ArtistNode | undefined;
          let artistNodeId = '';
          
          if (album['artist-credit'] && album['artist-credit'].length > 0) {
            const artistCredit = album['artist-credit'][0];
            if (artistCredit.artist) {
              // Check if we already have this artist
              artistNodeId = `artist-${artistCredit.artist.id}`;
              
              if (!this.tree.nodes[artistNodeId]) {
                // Add artist to tree
                this.tree.nodes[artistNodeId] = {
                  id: artistNodeId,
                  name: artistCredit.artist.name,
                  type: 'artist',
                  children: [],
                  details: artistCredit.artist
                };
                this.tree.rootIds.push(artistNodeId);
              }
              
              artistNode = this.tree.nodes[artistNodeId] as ArtistNode;
            }
          }
          
          // Add album to tree
          this.tree.nodes[nodeId] = {
            id: nodeId,
            name: album.title,
            type: 'album',
            parent: artistNodeId,
            children: [],
            details: album,
            artistId: artistNodeId,
            year: album.date ? album.date.split('-')[0] : undefined
          };
          
          // Connect to artist if we have one
          if (artistNode) {
            artistNode.children.push(nodeId);
          } else if (!artistNodeId) {
            // If no artist, make it a root
            this.tree.rootIds.push(nodeId);
          }
          
          albumIds.push(nodeId);
        } else {
          albumIds.push(nodeId);
        }
      }

      return albumIds;
    } catch (error) {
      console.error('Error searching albums:', error);
      return [];
    }
  }

  /**
   * Helper method to deduplicate releases and select the best one
   * This helps handle cases where the same album has multiple versions
   */
  private deduplicateReleases(releases: IReleaseMatch[]): IReleaseMatch[] {
    const uniqueByTitle: Record<string, IReleaseMatch[]> = {};
    
    // Group by title
    releases.forEach(release => {
      const title = release.title.toLowerCase();
      if (!uniqueByTitle[title]) {
        uniqueByTitle[title] = [];
      }
      uniqueByTitle[title].push(release);
    });
    
    // For each title, select the best release
    return Object.values(uniqueByTitle).map(releasesForTitle => {
      // Prefer releases with:
      // 1. Release with a date
      // 2. Release with cover art
      // 3. Release with most tracks
      // 4. First in the list
      
      // Sort by our preferences
      releasesForTitle.sort((a, b) => {
        // Prefer releases with a date
        if (a.date && !b.date) return -1;
        if (!a.date && b.date) return 1;
        
        // If both have dates, prefer the earlier one (original release)
        if (a.date && b.date) {
          return a.date.localeCompare(b.date);
        }
        
        // Prefer releases with more tracks
        if (a['track-count'] && b['track-count']) {
          return b['track-count'] - a['track-count'];
        }
        
        return 0;
      });
      
      // Return the best match
      return releasesForTitle[0];
    });
  }

  /**
   * Clear the tree and start fresh
   */
  clear(): void {
    this.tree = {
      nodes: {},
      rootIds: []
    };
  }
}