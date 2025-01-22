import { Skeleton } from '@/components/ui/skeleton';

type LoadingProps = {
  howMany?: number;

};




export default function SkeletonLoader({ howMany = 3 }: LoadingProps) {
  return (
    <div className="md:flex md:flex-col items-center justify-center space-y-6">
      {Array.from({ length: howMany }).map((_, index) => (
        <LoaderElements key={index} />
      ))}
    </div>
  );
}


export const LoaderElements = () => {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full bg-rosePine-highlightHigh" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px] bg-rosePine-highlightHigh" />
        <Skeleton className="h-4 w-[200px] bg-rosePine-highlightHigh" />
      </div>
    </div>
  );
};
