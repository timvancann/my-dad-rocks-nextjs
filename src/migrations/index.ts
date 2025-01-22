import * as migration_20250111_060402_initial from './20250111_060402_initial';
import * as migration_20250113_120733_add_musicbrainz from './20250113_120733_add_musicbrainz';

export const migrations = [
  {
    up: migration_20250111_060402_initial.up,
    down: migration_20250111_060402_initial.down,
    name: '20250111_060402_initial',
  },
  {
    up: migration_20250113_120733_add_musicbrainz.up,
    down: migration_20250113_120733_add_musicbrainz.down,
    name: '20250113_120733_add_musicbrainz'
  },
];
