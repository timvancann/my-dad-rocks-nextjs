import { gql } from '@apollo/client';

export const GET_GIGS = gql`
  query {
    Gigs {
      docs {
        id
        title
        date
        location
      }
    }
  }
`;
