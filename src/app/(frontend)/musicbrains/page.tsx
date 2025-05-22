'use client';
import { CoverArtArchiveApi, IArtistMatch, ICoverInfo, IRecordingMatch, IReleaseMatch, MusicBrainzApi } from 'musicbrainz-api';
import { useState } from 'react';

const config = {
  // Optional: MusicBrainz bot account credentials
  botAccount: {
    username: 'timvancann',
    password: 'AYG4pxr1qck.htj!dch'
  },

  // Optional: API base URL (default: 'https://musicbrainz.org')
  baseUrl: 'https://musicbrainz.org',

  // Required: Application details
  appName: 'my-dad-rocks',
  appVersion: '0.1.0',
  appMail: 'timvancann@gmail.com',

  // Optional: Disable rate limiting (default: false)
  disableRateLimiting: false
};

export default function Page() {
  const mbApi = new MusicBrainzApi(config);
  const coverArtArchiveApiClient = new CoverArtArchiveApi();

  async function getReleaseCoverArt(releaseMbid: string): Promise<ICoverInfo | null> {
    try {
      return await coverArtArchiveApiClient.getReleaseCovers(releaseMbid);
    } catch (error) {
      console.error(`Failed to fetch front:`, error);
    }
    return null;
  }

  const [artist, setArtist] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [album, setAlbum] = useState<string>('');

  const [artists, setArtists] = useState<IArtistMatch[]>();
  const [releases, setReleases] = useState<IReleaseMatch[]>();
  const [recordings, setRecordings] = useState<IRecordingMatch[]>();

  const [images, setImages] = useState<string[]>([]);

  const search = async () => {
    let query = `query='"${artist}"`;
    const arts = (await mbApi.search('artist', { query })).artists.slice(0, 4);
    setArtists(arts);

    query = `query='"${artist}" AND "${album}"'`;
    const rels = (await mbApi.search('release', { query })).releases.slice(0, 4);
    setReleases(rels);

    query = `query='"${artist}" AND "${album}" AND ${title}'`;
    const recs = (await mbApi.search('recording', { query })).recordings.slice(0, 4);
    setRecordings(recs);

    const imgs = await Promise.all(
      rels.map(async (r) => {
        const covers = await getReleaseCoverArt(r.id);
        const front = covers?.images.filter((i) => i.front).at(0);
        const thumb = front?.thumbnails[250];
        return thumb;
      })
    );
    setImages(imgs.filter((a) => a != null));
  };

  return (
    <div className="mx-2 items-center justify-center md:flex md:flex-col">
      <input type="text" value={artist} onChange={(event) => setArtist(event.target.value)} placeholder="artist" />
      <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="title" />
      <input type="text" value={album} onChange={(event) => setAlbum(event.target.value)} placeholder="album" />
      <button onClick={async () => await search()}>Zoek</button>

      <h2>Found Artists</h2>
      <ul>
        {artists?.map((a, idx) => {
          return (
            <li key={idx}>
              {a.name} - {a.disambiguation}
            </li>
          );
        })}
      </ul>

      <h2>Found Releases</h2>
      <ul>
        {releases?.map((a, idx) => {
          return (
            <li key={idx}>
              {a.title} - {a.disambiguation}
            </li>
          );
        })}
      </ul>

      <h2>Found Recordings</h2>
      <ul>
        {recordings?.map((a, idx) => {
          return (
            <li key={idx}>
              {a.title} - {a.disambiguation}
            </li>
          );
        })}
      </ul>

      {images.map((i, idx) => {
        return <img src={i} alt="" key={idx} />;
      })}
    </div>
  );
}
