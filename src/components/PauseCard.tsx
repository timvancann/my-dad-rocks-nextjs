'use client';

import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useFormStatus } from 'react-dom';
import { PendingIcon } from '@/components/PendingIcon';

type Props = {
  removeFromSetlistFn: () => void;
};

export const PauseCard = ({ removeFromSetlistFn }: Props) => {
  return (
    <div className={`flex flex-col grow gap-1 px-3 my-2 py-0 rounded-xl`}>
      <div className={'flex flex-row justify-between items-center'}>
        <div className={`flex flex-row items-center cursor-pointer ml-2`}>
          Pause
        </div>
        <form
          action={() => removeFromSetlistFn()}
        >
          <SubmitButton />
        </form>
      </div>
    </div>
  );
};

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <button
      type={'submit'}
      disabled={pending}
      className={`flex bg-rosePine-base rounded-xl p-1 drop-shadow-lg items-center gap-2 border border-rosePine-highlightMed`}>
      {pending ? <PendingIcon />
        : <>
          <XMarkIcon className={'h-4 w-4 text-rosePine-love'} />
        </>
      }
    </button>
  );
};
