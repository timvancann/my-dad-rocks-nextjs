// db.ts
import Dexie, { type EntityTable } from 'dexie';

interface AudioFile {
  id: string;
  title: string;
  version: number;
  blob: Blob;
}

const db = new Dexie('SongsDatabase') as Dexie & {
  audioFiles: EntityTable<
    AudioFile,
    'id' // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  audioFiles: '++id, title, version'
});

export { db };
export type { AudioFile };
