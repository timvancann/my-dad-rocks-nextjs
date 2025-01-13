import sharp from 'sharp';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { buildConfig } from 'payload';
import { Image, Audio } from '@/collections/Media';
import { Track } from '@/collections/Track';
import { Setlist } from '@/collections/Setlist';
import { Gig } from '@/collections/Gig';
import { gcsStorage } from '@payloadcms/storage-gcs';
import { nl } from 'payload/i18n/nl';
import { decode } from 'js-base64';

const myGcsAdapter = gcsStorage({
  collections: {
    audio: true,
    images: true
  },
  options: {
    credentials: JSON.parse(decode(process.env.GCS_CREDENTIALS || ''))
  },
  bucket: process.env.GCS_BUCKET || ''
});

export default buildConfig({
  editor: lexicalEditor({}),

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
  plugins: [myGcsAdapter],
  async onInit(payload) {
    if (!process.env.VERCEL_ENV) {
      const existingUsers = await payload.find({
        collection: 'users',
        limit: 1
      });

      if (existingUsers.docs.length === 0) {
        await payload.create({
          collection: 'users',
          data: {
            email: 'tim@gmail.com',
            password: 'test'
          }
        });
      }
    }

    const existingSetlists = await payload.find({
      collection: 'setlists',
      limit: 1
    });

    if (existingSetlists.docs.length === 0) {
      await payload.create({
        collection: 'setlists',
        data: {
          title: 'Oefenen',
          isPractice: true
        }
      });
    }
  },
  admin: {
    autoLogin: process.env.VERCEL_ENV
      ? {
          email: 'tim@gmail.com',
          password: 'test',
          prefillOnly: true
        }
      : false
  },
  sharp
});
