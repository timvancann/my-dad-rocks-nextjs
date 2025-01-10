import type { CollectionConfig } from 'payload'

export const Image: CollectionConfig = {
  slug: 'images',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    staticDir: './images',
    mimeTypes: ['image/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 64,
        height: 64,
        position: 'centre',
      },
      {
        name: 'player',
        width: 288,
        height: 288,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
  }
}

export const Audio: CollectionConfig = {
  slug: 'audio',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    staticDir: './audio',
    mimeTypes: ['audio/*'],
  }
}
