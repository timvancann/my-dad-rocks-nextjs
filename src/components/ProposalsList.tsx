'use client';

import { useEffect, useState } from 'react';
import { ProposalType } from '@/lib/interface';
import Image from 'next/image';
import { THEME } from '@/themes';
import { Music, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProposalsListProps {
  proposals: ProposalType[];
}

const ProposalCard = ({
  proposal,
  onDelete,
  isDeleting
}: {
  proposal: ProposalType;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) => {
  const handleClick = () => {
    if (proposal.uri) {
      window.open(proposal.uri, '_blank');
    }
  };

  const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDelete(proposal._id);
  };

  return (
    <div
      onClick={handleClick}
      className={`${THEME.card} ${THEME.border} border rounded-lg overflow-hidden hover:border-amber-400/50 transition-colors flex items-center gap-4 p-3 ${proposal.uri ? 'cursor-pointer' : ''}`}
    >
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
      <div className="flex flex-col items-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isDeleting}
          onClick={handleDelete}
          className="text-rose-400 hover:text-rose-300 hover:bg-rose-400/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        {isDeleting && <span className="text-[10px] text-gray-500">Verwijderen…</span>}
      </div>
    </div>
  );
};

export const ProposalsList = ({ proposals }: ProposalsListProps) => {
  const [items, setItems] = useState(proposals);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setItems(proposals);
  }, [proposals]);

  const handleDelete = async (id: string) => {
    const proposal = items.find(item => item._id === id);
    if (!proposal) return;

    const confirmed = window.confirm(`Weet je zeker dat je "${proposal.title}" wilt verwijderen?`);
    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/practice/proposals/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Verwijderen mislukt');
      }

      setItems(prev => prev.filter(item => item._id !== id));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Verwijderen mislukt';
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className={`${THEME.card} ${THEME.border} border rounded-lg p-8 text-center`}>
        <p className={THEME.textSecondary}>Nog geen voorstellen toegevoegd</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <div className="rounded-md border border-rose-500 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </div>
      )}
      {items.map((proposal) => (
        <ProposalCard
          key={proposal._id}
          proposal={proposal}
          onDelete={handleDelete}
          isDeleting={deletingId === proposal._id}
        />
      ))}
    </div>
  );
};
