import sharp from 'sharp';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { buildConfig } from 'payload';
import { Image, Audio } from '@/collections/Media';
import { Track } from '@/collections/Track';
import { Setlist } from '@/collections/Setlist';
import { Gig } from '@/collections/Gig';
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';
import { nl } from 'payload/i18n/nl';

export default buildConfig({
  editor: lexicalEditor(),

  collections: [Audio, Image, Track, Setlist, Gig],

  secret: process.env.PAYLOAD_SECRET || '',
  db: postgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || ''
    }
  }),
  i18n: {
    supportedLanguages: { nl }
  },
  plugins: process.env.BLOB_READ_WRITE_TOKEN
    ? [
        vercelBlobStorage({
          collections: { [(Image.slug, Audio.slug)]: true },
          token: process.env.BLOB_READ_WRITE_TOKEN || ''
        })
      ]
    : [],
  async onInit(payload) {
    const existingUsers = await payload.find({
      collection: 'users',
      limit: 1
    });

    // This is useful for local development
    // so you do not need to create a first-user every time
    if (existingUsers.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: 'tim@gmail.com',
          password: 'test'
        }
      });
    }
  },
  admin: {
    autoLogin: {
      email: 'tim@gmail.com',
      password: 'test',
      prefillOnly: true
    }
  },
  sharp
});
