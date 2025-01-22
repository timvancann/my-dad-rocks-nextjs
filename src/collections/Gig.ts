import { CollectionConfig } from 'payload';

export const Gig: CollectionConfig = {
  slug: 'gigs',
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
    { name: 'title', type: 'text' },
    {
      name: 'date',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'dd-MM-yyyy'
        }
      }
    },
    { name: 'location', type: 'textarea' },
    { name: 'googleMapsUrl', type: 'text' },
    { name: 'setlist', type: 'relationship', relationTo: 'setlists' }
  ]
};
