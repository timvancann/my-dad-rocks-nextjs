import sharp from 'sharp';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { buildConfig } from 'payload';
import { Image, Audio } from '@/collections/Media';
import { Track } from '@/collections/Track';
import { Setlist } from '@/collections/Setlist';
import { Gig } from '@/collections/Gig';

export default buildConfig({
  editor: lexicalEditor(),

  collections: [Audio, Image, Track, Setlist, Gig],

  secret: process.env.PAYLOAD_SECRET || '',
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || ''
    }
  }),
  sharp
});
