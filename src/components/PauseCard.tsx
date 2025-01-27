'use client';

import { PendingIcon } from '@/components/PendingIcon';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useFormStatus } from 'react-dom';

type Props = {
  removeFromSetlistFn: () => void;
};

export const PauseCard = ({ removeFromSetlistFn }: Props) => {
  return (
    <div className={`my-2 flex grow flex-col gap-1 rounded-xl px-3 py-0`}>
      <div className={'flex flex-row items-center justify-between'}>
        <div className={`ml-2 flex cursor-pointer flex-row items-center`}>Pause</div>
        <form action={() => removeFromSetlistFn()}>
          <SubmitButton />
        </form>
      </div>
    </div>
  );
};

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <button type={'submit'} disabled={pending} className={`flex items-center gap-2 rounded-xl border border-rosePine-highlightMed bg-rosePine-base p-1 drop-shadow-lg`}>
      {pending ? (
        <PendingIcon />
      ) : (
        <>
          <XMarkIcon className={'h-4 w-4 text-rosePine-love'} />
        </>
      )}
    </button>
  );
};
