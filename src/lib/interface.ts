export interface SongType {
  _id: string;
  _type?: string;
  title: string;
  artist?: string;
  slug?: string;
  artwork: string;
  artworkUrl?: string | null;
  audio?: string;
  audioUrl?: string | null;
  dualGuitar: boolean;
  dualVocal: boolean;
  canPlayWithoutSinger: boolean;
  duration: number;
  durationSeconds?: number;
  notes?: string;
  version?: number;
  // Stats fields (from Convex)
  timesPlayed?: number;
  timesPracticed?: number;
  masteryLevel?: number;
  lastPracticedAt?: number;
  lastPlayedAt?: number;
  firstLearnedAt?: number;
  // Stem count
  stemCount?: number;
}

export interface SetlistItemType {
  _id: string;
  setlistId: string;
  songId?: string;
  song?: SongType | null;
  itemType: 'song' | 'pause' | 'announcement' | 'intro' | 'outro';
  customTitle?: string;
  customDurationMinutes?: number;
  notes?: string;
  position: number;
}

export interface SetlistType {
  _id: string;
  title: string;
  songs: SongType[];
  items?: SetlistItemType[];
}

export interface GigType {
  _id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  video_playlist: string;
  setlist: SetlistType;
}

export interface GigsType {
  _id: string;
  title: string;
  date: string;
  time: string;
  address: string;
  venue: string;
  video_playlist: string;
}

export type LyricType = {
  id?: string;
  title: string;
  artist: string;
  lyrics: string;
}

export type ProposalVoteStatus = 'accepted' | 'rejected';

export interface ProposalVote {
  bandMemberId: string;
  status: ProposalVoteStatus;
}

export interface BandMember {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  avatarUrl: string | null;
}

export interface ProposalType {
  _id: string;
  band: string;
  title: string;
  album: string;
  coverart: string;
  created_at?: string;
  uri?: string;
  createdBy?: string | null;
  votes: ProposalVote[];
}

export interface ProposalsResponse {
  proposals: ProposalType[];
  bandMembers: BandMember[];
}
