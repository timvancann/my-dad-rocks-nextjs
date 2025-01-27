'use client';
import { createGig } from '@/actions/sanity';
import { SongsTitle } from '@/components/PlaylistTitle';
import { useRouter } from 'next/navigation';
import React, { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { MdCancel, MdSend } from 'react-icons/md';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { PendingIcon } from '@/components/PendingIcon';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

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
        <div className="mx-2 mb-2 mt-10 grid grid-cols-1 gap-2 rounded-lg border border-rosePine-highlightHigh bg-rosePine-highlightLow drop-shadow-lg">
          <SongsTitle title={'Nieuw optreden'} />
          <div className={'mx-6 flex-col'}>
            <label htmlFor="title" className="block text-sm/6 font-medium text-rosePine-text">
              Titel
            </label>
            <div>
              <div className="flex items-center rounded-md bg-rosePine-highlightLow pl-3 outline outline-1 -outline-offset-1 outline-rosePine-highlightHigh focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-rosePine-love">
                <input type="text" name="title" id="title" className="block min-w-0 grow bg-rosePine-highlightLow px-3 py-1.5 text-sm text-rosePine-text focus:outline focus:outline-0" />
              </div>
            </div>
          </div>
          <div className={'mx-6'}>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'default'}
                  className={cn(
                    'w-full justify-start bg-rosePine-highlightLow text-sm text-rosePine-text',
                    'border border-rosePine-highlightHigh hover:bg-rosePine-highlightLow',
                    'hover:outline hover:outline-rosePine-love',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon />
                  {date ? format(date, 'yyyy-MM-dd') : <span>Datum</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto border border-rosePine-highlightHigh p-0 text-rosePine-text" align="start">
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
                  className="rounded border-rosePine-highlightHigh bg-rosePine-highlightLow"
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className={'mx-5 my-4 flex justify-end gap-2'}>
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
    <button type={'reset'} onClick={() => router.push('/gigs')} className={'flex items-center gap-2 rounded-xl border border-rosePine-highlightMed bg-rosePine-base p-2 drop-shadow-lg'}>
      <p className={'text-xs'}>Annuleren</p>
      <MdCancel className={'h-6 w-6 text-rosePine-love'} />
    </button>
  );
};

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <button type={'submit'} disabled={pending} className={`flex items-center gap-2 rounded-xl border border-rosePine-highlightMed bg-rosePine-base p-2 drop-shadow-lg`}>
      {pending ? (
        <PendingIcon />
      ) : (
        <>
          <span className={'text-xs'}>Opslaan</span>
          <MdSend className={'h-6 w-6 text-rosePine-love'} />
        </>
      )}
    </button>
  );
};
