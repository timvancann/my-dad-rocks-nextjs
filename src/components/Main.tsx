import React from 'react';

export const Main = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className={'pb-16'}>{children}</main>
  );
};
