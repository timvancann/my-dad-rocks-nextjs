type DividerProps = {
  className?: string;
};
export const Divider = ({ className }: DividerProps) => {
  return <div className={`mx-auto h-px w-[90%] bg-rosePine-highlightMed ${className}`} />;
};
