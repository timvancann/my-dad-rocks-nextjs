'use client';
import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { client } from '@/lib/apollo';

export const Main = ({ children }: { children: React.ReactNode }) => {
  return (
    <ApolloProvider client={client}>
      <main className={'pb-16'}>{children}</main>
    </ApolloProvider>
  );
};
