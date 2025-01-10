'use client';
import { SongsTitle } from '@/components/PlaylistTitle';
import { MdSend } from 'react-icons/md';
import React from 'react';
import { useRouter } from 'next/navigation';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { gql, useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const CREATE_GIG = gql`
  mutation CreateGig($title: String!, $date: String!, $setlistId: Int!) {
    createGig(data: { title: $title, date: $date, setlist: $setlistId }) {
      id
    }
  }
`;

const CREATE_SETLIST = gql`
  mutation CreateSetlist($title: String!) {
    createSetlist(data:{title: $title}) {
      id
    }
  }
`

export default function Home() {
  const [createGig] = useMutation(CREATE_GIG);
  const [createSetlist] = useMutation(CREATE_SETLIST);

  const router = useRouter();

  const formSchema = z.object({
    title: z.string(),
    date: z.date().optional(),
    googleMapsUrl: z.string().trim().optional(),
    location: z.string().trim().optional()
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { data } = (await createSetlist({ variables: { title: values.title } })) as {
      data: {
        createSetlist: {
          id: number
        }
      }
    };
    console.log(data)
    await createGig({
      variables: {
        setlistId: data.createSetlist.id,
        date: values.date && format(values.date, 'yyyy-MM-dd'),
        title: values.title,
        googleMapsUrl: values.googleMapsUrl,
        location: values.location

      }
    })
    router.push(`/gigs/`);
  }

  return (
    <>
      <div className="md:flex md:flex-col items-center justify-center mx-2">
        <SongsTitle title={'Nieuw optreden'} />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titel</FormLabel>
                  <FormControl>
                    <Input className="bg-rosePine-highlightLow" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Datum</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={'outline'} className={cn('pl-3 text-left font-normal bg-rosePine-highlightLow', !field.value && 'text-muted-foreground')}>
                          {field.value ? format(field.value, 'd LLLL y') : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date('1900-01-01')} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>

            <FormField
              control={form.control}
              name="googleMapsUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Maps URL</FormLabel>
                  <FormControl>
                    <Input className="bg-rosePine-highlightLow" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschrijving</FormLabel>
                  <FormControl>
                    <Textarea className="bg-rosePine-highlightLow" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button variant="outline" type="submit">
                <span className={'text-xs'}>Opslaan</span>
                <MdSend className={'h-6 w-6 text-rosePine-love'} />
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
