import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
  uri: '/api/graphql' // Payload's GraphQL endpoint
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Setlist: {
        fields: {
          items: {
            // Helps with array updates and reordering
            merge: false
          }
        }
      }
    }
  })
});
