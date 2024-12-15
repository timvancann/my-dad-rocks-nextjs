'use client';
import { SongsTitle } from '@/components/PlaylistTitle';
import { MdCancel, MdPending, MdSend } from 'react-icons/md';
import React from 'react';
import { createGig } from '@/actions/sanity';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';


export const AddGig = () => {

  const router = useRouter();
  const [state, formAction] = useFormState(async (prevState: any, formData: FormData) => {
    const result = await createGig(prevState, formData);
    if (result.success) {
      router.push('/gigs');
    }
    return result;
  }, null);


  return (
    <form action={formAction}>
      <div>
        <div
          className="mt-10 grid grid-cols-1 mb-2 bg-rosePine-highlightLow mx-2 rounded-lg border border-rosePine-highlightHigh drop-shadow-lg gap-2">
          <SongsTitle title={'Nieuw optreden'} />
          <div className={'flex-col mx-6'}>
            <label htmlFor="title" className="block text-sm/6 font-medium text-rosePine-text">Titel</label>
            <div>
              <div
                className="flex items-center rounded-md bg-rosePine-highlightLow pl-3 outline outline-1 -outline-offset-1 outline-rosePine-highlightHigh focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-rosePine-love">
                <input type="text" name="title" id="title"
                       className="bg-rosePine-highlightLow block min-w-0 grow py-1.5 px-3 text-rosePine-text focus:outline focus:outline-0 sm:text-sm/6"
                />
              </div>
            </div>
          </div>
          <div className={'flex-col mx-6'}>
            <label htmlFor="date" className="block text-sm/6 font-medium text-rosePine-text">Datum</label>
            <div>
              <div
                className="flex items-center rounded-md bg-rosePine-highlightLow pl-3 outline outline-1 -outline-offset-1 outline-rosePine-highlightHigh focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-rosePine-love">
                <input type="text" name="date" id="date"
                       className="bg-rosePine-highlightLow block min-w-0 grow py-1.5 px-3 text-rosePine-text focus:outline focus:outline-0 sm:text-sm/6"
                       placeholder={'yyyy-mm-dd'}
                />
              </div>
            </div>
          </div>
          <div className={'flex justify-end gap-2 mx-5 my-4'}>
            <CancelButton />
            <SubmitButton />
          </div>
        </div>
      </div>
    </form>
  );
};

const CancelButton = () => {
  const router = useRouter();
  return (
    <button
      type={'reset'}
      onClick={() => router.push('/gigs')}
      className={'flex bg-rosePine-base rounded-xl p-2 drop-shadow-lg items-center gap-2 border border-rosePine-highlightMed'}>
      <p className={'text-xs'}>Annuleren</p>
      <MdCancel className={'h-6 w-6 text-rosePine-love'} />
    </button>
  );
};

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <button
      type={'submit'}
      disabled={pending}
      className={`flex bg-rosePine-base rounded-xl p-2 drop-shadow-lg items-center gap-2 border border-rosePine-highlightMed ${pending ? '' : ''}`}>
      {pending ?
        <MdPending className={'h-6 w-6 text-rosePine-love'} /> :
        <>
          <p className={'text-xs'}>Opslaan</p>
          <MdSend className={'h-6 w-6 text-rosePine-love'} />
        </>
      }
    </button>
  );
};
