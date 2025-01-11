import * as migration_20250111_060402_initial from './20250111_060402_initial';

export const migrations = [
  {
    up: migration_20250111_060402_initial.up,
    down: migration_20250111_060402_initial.down,
    name: '20250111_060402_initial'
  },
];
