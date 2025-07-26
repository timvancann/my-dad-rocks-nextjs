'use client';

import { ProposalType } from '@/lib/interface';
import Image from 'next/image';
import { THEME } from '@/themes';
import { Music } from 'lucide-react';

interface ProposalsListProps {
  proposals: ProposalType[];
}

const ProposalCard = ({ proposal }: { proposal: ProposalType }) => {

  return (
    <div className={`${THEME.card} ${THEME.border} border rounded-lg overflow-hidden hover:border-amber-400/50 transition-colors flex items-center gap-4 p-3`}>
      <div className="relative w-16 h-16 flex-shrink-0 bg-zinc-800 rounded-md overflow-hidden">
        {proposal.coverart ? (
          <Image
            src={proposal.coverart}
            alt={`${proposal.album} cover`}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Music className="h-8 w-8 text-zinc-600" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm text-gray-100 truncate">{proposal.title}</h3>
        <p className={`${THEME.textSecondary} text-xs truncate`}>{proposal.band}</p>
        {proposal.album && (
          <p className={`${THEME.textSecondary} text-xs mt-0.5 truncate italic opacity-75`}>{proposal.album}</p>
        )}
      </div>
    </div>
  );
};

export const ProposalsList = ({ proposals }: ProposalsListProps) => {
  if (!proposals || proposals.length === 0) {
    return (
      <div className={`${THEME.card} ${THEME.border} border rounded-lg p-8 text-center`}>
        <p className={THEME.textSecondary}>Nog geen voorstellen toegevoegd</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {proposals.map((proposal) => (
        <ProposalCard key={proposal._id} proposal={proposal} />
      ))}
    </div>
  );
};
