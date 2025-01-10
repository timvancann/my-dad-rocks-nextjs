import * as migration_20241222_075827_initial from './20241222_075827_initial';

export const migrations = [
  {
    up: migration_20241222_075827_initial.up,
    down: migration_20241222_075827_initial.down,
    name: '20241222_075827_initial'
  },
];
