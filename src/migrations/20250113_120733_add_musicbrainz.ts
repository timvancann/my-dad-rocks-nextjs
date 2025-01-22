import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tracks" ADD COLUMN "artist_id" varchar;
  ALTER TABLE "tracks" ADD COLUMN "release_id" varchar;
  ALTER TABLE "tracks" ADD COLUMN "recording_id" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tracks" DROP COLUMN IF EXISTS "artist_id";
  ALTER TABLE "tracks" DROP COLUMN IF EXISTS "release_id";
  ALTER TABLE "tracks" DROP COLUMN IF EXISTS "recording_id";`)
}
