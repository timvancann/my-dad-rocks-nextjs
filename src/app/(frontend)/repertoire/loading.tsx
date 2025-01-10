import SkeletonLoader from '@/components/SkeletonLoader';

export default function Loading() {
  const howMany = 8;
  return <SkeletonLoader howMany={3} />
}

