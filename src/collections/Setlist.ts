import { CollectionConfig } from 'payload';

export const Setlist: CollectionConfig = {
  slug: 'setlists',
  access: {
    create: () => true,
    read: () => true,
    update: () => true,
    delete: () => true
  },
  admin: {
    useAsTitle: 'title'
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'isPractice', type: 'checkbox', defaultValue: false, required: true },
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'itemType',
          type: 'select',
          options: ['track', 'break'],
          defaultValue: 'track',
          required: true
        },
        {
          name: 'track',
          type: 'relationship',
          relationTo: 'tracks',
          admin: {
            condition: (data, siblingData) => {
              return siblingData['itemType'] === 'track';
            }
          }
        },
        {
          name: 'notes',
          type: 'text'
        }
      ]
    }
  ]
};
