'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { BandMember, ProposalType, ProposalVoteStatus } from '@/lib/interface';
import { THEME } from '@/themes';
import { CheckCircle2, ExternalLink, Music, Trash2, XCircle } from 'lucide-react';
import { FaSpotify } from 'react-icons/fa';

interface ProposalsListProps {
  proposals: ProposalType[];
  bandMembers: BandMember[];
}

const getMemberLabel = (member: BandMember) => {
  if (member.name && member.name.trim().length > 0) {
    return member.name.trim();
  }
  return member.email;
};

const getInitials = (member: BandMember) => {
  const label = getMemberLabel(member);
  const parts = label
    .split(' ')
    .map(part => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return label.slice(0, 2).toUpperCase();
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const statusLabel = (status: ProposalVoteStatus | null) => {
  switch (status) {
    case 'accepted':
      return 'Akkoord';
    case 'rejected':
      return 'Afgewezen';
    default:
      return 'Open';
  }
};

const ProposalCard = ({
  proposal,
  bandMembers,
  onDelete,
  onVote,
  isDeleting,
  isUpdating,
  currentMemberId,
  isExpanded,
  onToggle
}: {
  proposal: ProposalType;
  bandMembers: BandMember[];
  onDelete: (id: string) => void;
  onVote: (proposalId: string, status: ProposalVoteStatus | null) => void;
  isDeleting: boolean;
  isUpdating: boolean;
  currentMemberId: string | null;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const votesByMember = useMemo(() => {
    const map = new Map<string, ProposalVoteStatus>();
    for (const vote of proposal.votes || []) {
      if (vote.bandMemberId && (vote.status === 'accepted' || vote.status === 'rejected')) {
        map.set(vote.bandMemberId, vote.status);
      }
    }
    return map;
  }, [proposal.votes]);

  const acceptedCount = useMemo(() => {
    let count = 0;
    for (const vote of votesByMember.values()) {
      if (vote === 'accepted') count += 1;
    }
    return count;
  }, [votesByMember]);

  const rejectedCount = useMemo(() => {
    let count = 0;
    for (const vote of votesByMember.values()) {
      if (vote === 'rejected') count += 1;
    }
    return count;
  }, [votesByMember]);

  const totalMembers = bandMembers.length;
  const pendingCount = Math.max(totalMembers - acceptedCount - rejectedCount, 0);

  const readyThreshold = Math.ceil(totalMembers * 0.75) || totalMembers;
  const isReady = acceptedCount >= readyThreshold && totalMembers > 0;

  const currentVote = currentMemberId ? votesByMember.get(currentMemberId) ?? null : null;
  const voteDisabled = !currentMemberId || isUpdating;

  const proposer = proposal.createdBy ? bandMembers.find(member => member.id === proposal.createdBy) : null;
  const proposerLabel = proposer ? getMemberLabel(proposer) : null;

  const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDelete(proposal._id);
  };

  const handleVote = (status: ProposalVoteStatus) => {
    if (voteDisabled) return;
    const nextStatus = currentVote === status ? null : status;
    onVote(proposal._id, nextStatus);
  };

  const handleOpenSpotify = () => {
    if (proposal.uri) {
      window.open(proposal.uri, '_blank', 'noopener,noreferrer');
    }
  };

  const summaryText = `${acceptedCount} akkoord · ${rejectedCount} afgewezen · ${pendingCount} open`;

  return (
    <div
      className={`${THEME.card} ${THEME.border} border rounded-xl p-4 flex flex-col gap-4 transition-colors cursor-pointer`}
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onToggle();
        }
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800">
          {proposal.coverart ? (
            <Image
              src={proposal.coverart}
              alt={`${proposal.album || proposal.title} cover`}
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
        <div className="flex-1 min-w-0 mr-2">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-semibold text-base text-gray-100 truncate">{proposal.title}</h3>
              <p className={`${THEME.textSecondary} text-sm truncate`}>{proposal.band}</p>
              {proposal.album && (
                <p className={`${THEME.textSecondary} text-xs truncate italic opacity-75`}>{proposal.album}</p>
              )}
              {proposerLabel && (
                <p className="text-[11px] text-zinc-500 mt-1">Voorgesteld door {proposerLabel}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-4 pt-1">
              {proposal.uri && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleOpenSpotify();
                  }}
                  className="h-10 w-24 border border-zinc-700 bg-zinc-800 text-gray-200 hover:bg-zinc-700"
                  aria-label="Open in Spotify"
                >
                  <FaSpotify className='h-4 w-4'/> Luister
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div
          className="flex flex-col gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={(event) => {
                event.stopPropagation();
                handleVote('accepted');
              }}
              disabled={voteDisabled}
              className={clsx(
                'flex-1 justify-center gap-2 rounded-lg border text-sm font-medium transition-colors',
                voteDisabled && 'opacity-70',
                currentVote === 'accepted'
                  ? 'border-green-500 bg-green-500/20 text-green-200 hover:bg-green-500/30'
                  : 'border-zinc-700 bg-zinc-800 text-gray-100 hover:bg-zinc-700'
              )}
            >
              <CheckCircle2 className="h-4 w-4" /> Akkoord
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={(event) => {
                event.stopPropagation();
                handleVote('rejected');
              }}
              disabled={voteDisabled}
              className={clsx(
                'flex-1 justify-center gap-2 rounded-lg border text-sm font-medium transition-colors',
                voteDisabled && 'opacity-70',
                currentVote === 'rejected'
                  ? 'border-red-500 bg-red-500/20 text-red-200 hover:bg-red-500/30'
                  : 'border-zinc-700 bg-zinc-800 text-gray-100 hover:bg-zinc-700'
              )}
            >
              <XCircle className="h-4 w-4" /> Afwijzen
            </Button>
          </div>
          {!currentMemberId && (
            <p className="text-xs text-zinc-500">Meld je aan als bandlid om te stemmen.</p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className='flex justify-between'>
          <div className="flex flex-wrap items-center gap-3">
            {bandMembers.map((member) => {
              const memberStatus = votesByMember.get(member.id) ?? null;
              const initials = getInitials(member);
              const showAvatar = Boolean(member.avatarUrl);
              return (
                <div
                  key={member.id}
                  className={clsx(
                    'relative h-9 w-9 overflow-hidden flex items-center justify-center rounded-full text-xs font-semibold uppercase transition-colors duration-150 border-2',
                    memberStatus === 'accepted' && 'border-green-500',
                    memberStatus === 'rejected' && 'border-red-500',
                    memberStatus === null && 'border-zinc-700',
                    showAvatar ? 'bg-zinc-900/40 text-white' : 'bg-zinc-800 text-zinc-200'
                  )}
                  title={`${getMemberLabel(member)} · ${statusLabel(memberStatus)}`}
                >
                  {member.avatarUrl ? (
                    <Image
                      src={member.avatarUrl}
                      alt={`${getMemberLabel(member)} avatar`}
                      fill
                      className="object-cover"
                      sizes="36px"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                  {memberStatus && (
                    <span
                      className={clsx(
                        'absolute -bottom-1 -right-1 h-4 w-4 rounded-full border border-zinc-900 text-[10px] font-semibold text-zinc-950 flex items-center justify-center',
                        memberStatus === 'accepted' ? 'bg-green-400' : 'bg-red-400'
                      )}
                    >
                      {memberStatus === 'accepted' ? '✓' : '×'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-end">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isDeleting}
              onClick={(event) => {
                event.stopPropagation();
                handleDelete(event);
              }}
              className="h-10 w-10 text-rose-400 hover:text-rose-200 hover:bg-rose-400/10"
              aria-label="Voorstel verwijderen"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            {isDeleting && <span className="text-[10px] text-gray-500 ml-2">Verwijderen…</span>}
          </div>

        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
          <span>{summaryText}</span>
          {isReady && <span className="font-medium text-emerald-400">Klaar om toe te voegen</span>}
        </div>
      </div>

    </div>
  );
};

export const ProposalsList = ({ proposals, bandMembers }: ProposalsListProps) => {
  const { data: session } = useSession();
  const [items, setItems] = useState(proposals);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setItems(proposals);
  }, [proposals]);

  const currentEmail = session?.user?.email?.toLowerCase() ?? null;
  const currentMember = useMemo(() => {
    if (!currentEmail) return null;
    return bandMembers.find(member => member.email.toLowerCase() === currentEmail) ?? null;
  }, [bandMembers, currentEmail]);

  const currentAvatar = session?.user?.image ?? null;

  const displayBandMembers = useMemo(() => {
    if (!currentMember?.id || !currentAvatar) {
      return bandMembers;
    }

    return bandMembers.map(member =>
      member.id === currentMember.id
        ? { ...member, avatarUrl: member.avatarUrl ?? currentAvatar }
        : member
    );
  }, [bandMembers, currentMember?.id, currentAvatar]);

  const handleToggleCard = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

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

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
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

  const handleVote = async (proposalId: string, status: ProposalVoteStatus | null) => {
    if (!currentMember) {
      setError('Je bent niet gekoppeld aan een bandlid, stemmen lukt momenteel niet.');
      return;
    }

    const proposal = items.find(item => item._id === proposalId);
    if (!proposal) {
      return;
    }

    const previousVotes = proposal.votes;

    const nextVotes = (() => {
      const filtered = proposal.votes.filter(vote => vote.bandMemberId !== currentMember.id);
      if (status) {
        return [...filtered, { bandMemberId: currentMember.id, status }];
      }
      return filtered;
    })();

    setItems(prev => prev.map(item => (item._id === proposalId ? { ...item, votes: nextVotes } : item)));
    setUpdatingId(proposalId);
    setError(null);

    try {
      let response: Response;
      if (status) {
        response = await fetch(`/api/practice/proposals/${proposalId}/vote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status })
        });
      } else {
        response = await fetch(`/api/practice/proposals/${proposalId}/vote`, {
          method: 'DELETE'
        });
      }

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Stem opslaan mislukt');
      }

      const latestVotes = Array.isArray(result.votes)
        ? result.votes
          .filter((vote: any) => vote?.band_member_id && vote?.status)
          .map((vote: any) => ({
            bandMemberId: vote.band_member_id as string,
            status: vote.status as ProposalVoteStatus
          }))
        : nextVotes;

      setItems(prev => prev.map(item => (item._id === proposalId ? { ...item, votes: latestVotes } : item)));
      setExpandedId(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Stem opslaan mislukt';
      setError(message);
      setItems(prev => prev.map(item => (item._id === proposalId ? { ...item, votes: previousVotes } : item)));
    } finally {
      setUpdatingId(null);
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
    <div className="flex flex-col gap-3">
      {error && (
        <div className="rounded-md border border-rose-500 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </div>
      )}
      {items.map(proposal => (
        <ProposalCard
          key={proposal._id}
          proposal={proposal}
          bandMembers={displayBandMembers}
          onDelete={handleDelete}
          onVote={handleVote}
          isDeleting={deletingId === proposal._id}
          isUpdating={updatingId === proposal._id}
          currentMemberId={currentMember?.id ?? null}
          isExpanded={expandedId === proposal._id}
          onToggle={() => handleToggleCard(proposal._id)}
        />
      ))}
    </div>
  );
};
