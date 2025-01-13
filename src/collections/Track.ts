import { CollectionConfig } from 'payload';

export const Track: CollectionConfig = {
  slug: 'tracks',
  access: {
    read: () => true
  },
  admin: {
    useAsTitle: 'title'
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'artist', type: 'text', required: true },
    { name: 'tweeGitaren', type: 'checkbox', defaultValue: false, required: true },
    { name: 'meerstemmig', type: 'checkbox', defaultValue: false, required: true },
    { name: 'lyrics', type: 'richText' },
    {
      label: 'files',
      type: 'collapsible',
      fields: [
        { name: 'coverart', type: 'upload', relationTo: 'images', required: true },
        { name: 'audio', type: 'upload', relationTo: 'audio', required: true }
      ]
    },
    {
      label: 'musicbrainz',
      type: 'collapsible',
      fields: [
        { name: 'artistId', type: 'text', required: false },
        { name: 'releaseId', type: 'text', required: false },
        { name: 'recordingId', type: 'text', required: false }
      ]
    }
    // {
    //   label: 'tonal', type: 'collapsible', fields: [
    //
    //     { name: 'baseNote', type: 'select', options: ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] },
    //     {
    //       name: 'scale',
    //       type: 'select',
    //       options: ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian']
    //     }
    //   ]
    // }
  ]
};
