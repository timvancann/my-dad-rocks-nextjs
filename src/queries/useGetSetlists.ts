import { gql } from '@apollo/client';

const UPDATE_SETLISTS = gql`
  mutation UpdateSetlist($id: Int!, $items: [mutationSetlistUpdate_ItemsInput]) {
    updateSetlist(id: $id, data: { items: $items }) {
      id
      title
      isPractice
      items {
        id
        itemType
        track {
          id
          title
          artist
          coverart {
            thumbnailURL
            url
          }
          audio {
            url
          }
        }
      }
    }
  }
`;
