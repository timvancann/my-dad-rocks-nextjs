import { GigsType } from '@/lib/interface';
import { THEME } from '@/themes';
import { ChevronRight, MapPin } from 'lucide-react';
import Link from 'next/link';

type GigCardProps = {
  gig: GigsType;
};
export const GigCard = ({ gig }: GigCardProps) => {
  const upcoming = new Date(gig.date) > new Date();
  const month = new Date(gig.time).toLocaleString('default', { month: 'short' });
  const day = new Date(gig.time).getDate();
  return (
    <Link href={`/practice/gigs/${gig._id}`} className={'cursor-pointer'}>
      <div className={`overflow-hidden rounded-lg ${upcoming ? THEME.card : 'bg-zinc-900/50'} border ${upcoming ? 'border-zinc-800' : 'border-zinc-800/50'} shadow-md`}>
        <div className="flex">
          {/* Date display */}
          <div className={`flex w-16 flex-col items-center justify-center py-4 ${upcoming ? 'bg-zinc-800' : 'bg-zinc-800/50'}`}>
            <span className={`text-sm font-medium uppercase ${upcoming ? THEME.secondary : 'text-gray-400'}`}>{month}</span>
            <span className={`text-2xl font-bold ${upcoming ? 'text-white' : 'text-gray-400'}`}>{day}</span>
          </div>

          {/* Gig details */}
          <div className="flex-1 p-3">
            <div className="flex items-start justify-between">
              <h3 className={`truncate font-bold ${upcoming ? 'text-white' : 'text-gray-400'}`}>{gig.title}</h3>
            </div>

            <div className="mt-1.5 flex items-start gap-1">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-500" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-300">{gig.venue}</span>
                <span className="text-xs text-gray-500">{gig.address}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center pr-2">
            <button className={`rounded-full p-1.5 ${upcoming ? THEME.highlight : 'bg-zinc-800/50'}`}>
              <ChevronRight className={`h-5 w-5 ${upcoming ? THEME.secondary : 'text-gray-600'}`} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};
