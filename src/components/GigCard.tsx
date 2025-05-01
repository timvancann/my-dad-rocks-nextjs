import { GigsType } from '@/lib/interface';
import { CalendarIcon } from '@heroicons/react/16/solid';
import Link from 'next/link';

type GigCardProps = {
  gig: GigsType;
};
export const GigCard = ({ gig }: GigCardProps) => {
  return (
    <Link href={`/gigs/${gig._id}`} className={'cursor-pointer'}>
      <div className={`flex grow flex-col px-3 py-2`}>
        <div className={'flex flex-row items-center gap-4'}>
          <CalendarIcon className={'h-10 w-10 text-rosePine-gold'} />
          <div className={'mr-6'}>
            <h1 className={'font-bold text-rosePine-text'}>{gig.title}</h1>
            <h2 className={`text-sm font-normal text-rosePine-text`}>{gig.date}</h2>
          </div>
        </div>
      </div>
    </Link>
  );
};
