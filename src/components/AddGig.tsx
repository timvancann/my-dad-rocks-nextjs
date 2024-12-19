'use client';
import { SongsTitle } from '@/components/PlaylistTitle';
import { MdCancel, MdSend } from 'react-icons/md';
import React, { useActionState } from 'react';
import { createGig } from '@/actions/sanity';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PendingIcon } from '@/components/PendingIcon';

export const AddGig = () => {
  const [date, setDate] = React.useState<Date>();


  const router = useRouter();
  const [state, formAction] = useActionState(async (prevState: any, formData: FormData) => {
    const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
    formData.append('date', formattedDate);
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
                       className="bg-rosePine-highlightLow block min-w-0 grow py-1.5 px-3 text-rosePine-text focus:outline focus:outline-0 text-sm"
                />
              </div>
            </div>
          </div>
          <div className={'mx-6'}>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'default'}
                  className={cn(
                    'bg-rosePine-highlightLow text-rosePine-text text-sm w-full justify-start border border-rosePine-highlightHigh hover:bg-rosePine-highlightLow hover:outline hover:outline-rosePine-love',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon />
                  {date ? format(date, 'yyyy-MM-dd') : <span>Datum</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border border-rosePine-highlightHigh text-rosePine-text"
                              align="start">
                <Calendar
                  classNames={{
                    day_selected:
                      'bg-rosePine-highlightMed text-rosePine-text hover:bg-rosePine-highlightHigh hover:text-rosePine-text hover:border hover:border-rosePine-love focus:bg-rosePine-highlightMed focus:text-rosePine-love focus:border-2 focus:rounded-lg focus:border-rosePine-love',
                    day_today: 'bg-rosePine-highlightMed text-rosePine-text',
                    cell: 'w-8 h-8 [&:has([aria-selected])]:bg-rosePine-highlightLow'
                  }}
                  mode="single"
                  defaultMonth={date}
                  selected={date}
                  onSelect={setDate}
                  className="bg-rosePine-highlightLow border-rosePine-highlightHigh rounded"
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className={'flex justify-end gap-2 mx-5 my-4'}>
            <CancelButton />
            <SubmitButton />
          </div>
        </div>
      </div>
    </form>
  )
    ;
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
      className={`flex bg-rosePine-base rounded-xl p-2 drop-shadow-lg items-center gap-2 border border-rosePine-highlightMed`}>
      {pending ? <PendingIcon />
        : <>
          <span className={'text-xs'}>Opslaan</span>
          <MdSend className={'h-6 w-6 text-rosePine-love'} />
        </>
      }
    </button>
  );
};
