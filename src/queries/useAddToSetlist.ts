import { gql, useMutation } from '@apollo/client';

const GET_SETLISTS = gql`
  query {
    Setlist(id: $id) {
      docs {
        id
        items {
          id
          itemType
        }
      }
    }
  }
`;
