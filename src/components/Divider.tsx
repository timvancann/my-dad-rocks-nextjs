import React from 'react';

type DividerProps = {
  className?: string;
};
export const Divider = ({className}: DividerProps) => {
  return <div className={`mx-auto w-[90%] h-px bg-rosePine-highlightMed ${className}`} />;
};
