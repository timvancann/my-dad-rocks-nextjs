import { Buffer } from 'buffer';

const clientId = process.env.NEXT_PRIVATE_SPOTIFY_CLIENT_ID;
const clientSecret = process.env.NEXT_PRIVATE_SPOTIFY_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.warn('Spotify client credentials are not configured. Set NEXT_PRIVATE_SPOTIFY_CLIENT_ID and NEXT_PRIVATE_SPOTIFY_CLIENT_SECRET to enable artwork lookup.');
}

interface SpotifyTokenCache {
  accessToken: string;
  expiresAt: number;
}

let tokenCache: SpotifyTokenCache | null = null;

async function getAccessToken(): Promise<string> {
  if (!clientId || !clientSecret) {
    throw new Error('Spotify client credentials are missing.');
  }

  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 5000) {
    return tokenCache.accessToken;
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Spotify token request failed: ${response.status} ${text}`);
  }

  const tokenResponse = (await response.json()) as { access_token: string; expires_in: number };
  tokenCache = {
    accessToken: tokenResponse.access_token,
    expiresAt: Date.now() + tokenResponse.expires_in * 1000
  };

  return tokenCache.accessToken;
}

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyTrackResult {
  id: string;
  name: string;
  albumName: string;
  artists: string[];
  images: SpotifyImage[];
  previewUrl: string | null;
  uri: string;
  externalUrl: string | null;
}

interface SpotifySearchParams {
  title?: string;
  artist?: string;
  limit?: number;
}

export async function searchSpotifyTracks({ title, artist, limit = 8 }: SpotifySearchParams): Promise<SpotifyTrackResult[]> {
  const token = await getAccessToken();

  const searchTerms: string[] = [];
  if (title) {
    searchTerms.push(`track:${title}`);
  }
  if (artist) {
    searchTerms.push(`artist:${artist}`);
  }

  const query = searchTerms.length > 0 ? searchTerms.join(' ') : `${title ?? ''} ${artist ?? ''}`.trim();

  if (!query) {
    return [];
  }

  const params = new URLSearchParams({
    q: query,
    type: 'track',
    limit: String(limit)
  });

  const response = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Spotify search failed: ${response.status} ${text}`);
  }

  const data = (await response.json()) as {
    tracks?: {
      items?: Array<{
        id: string;
        name: string;
        album: { name: string; images: SpotifyImage[] };
        artists: Array<{ name: string }>;
        preview_url: string | null;
        uri: string;
        external_urls?: { spotify?: string };
      }>;
    };
  };

  const items = data.tracks?.items ?? [];

  return items.map((item) => {
    const externalSpotifyUrl = item.external_urls?.spotify ?? null;

    return {
      id: item.id,
      name: item.name,
      albumName: item.album.name,
      artists: item.artists.map((artistItem) => artistItem.name),
      images: item.album.images,
      previewUrl: item.preview_url,
      uri: externalSpotifyUrl ?? item.uri,
      externalUrl: externalSpotifyUrl
    };
  });
}
