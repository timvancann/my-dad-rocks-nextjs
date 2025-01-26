import SkeletonLoader from '@/components/SkeletonLoader';

export default function Loading({ num }: { num: number }) {
  return <SkeletonLoader howMany={num} />;
}
