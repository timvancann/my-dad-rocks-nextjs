export interface SongType {
    _id: string;
    id: string;
    title?: string;
    artist?: string;
    cover_art?: any;
    audio?: any;
    last_played_at?: string;
}

export interface SetlistType {
    _id: string;
    title: string;
    songs: SongType[];
}

export interface GigType {
    _id: string;
    title: string;
    date: string;
    address: string;
    video_playlist: string;
    setlist: SetlistType;
}

export interface GigsType {
    _id: string;
    title: string;
    date: string;
    video_playlist: string;
}

