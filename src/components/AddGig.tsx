'use client';
import { createGigWithSetlist } from '@/actions/supabase';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useFormStatus } from 'react-dom';

import { format } from 'date-fns';
import { CalendarIcon, Clock, MapPin, Music, ArrowLeft, Save } from 'lucide-react';

import { PendingIcon } from '@/components/PendingIcon';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { THEME } from '@/themes';
import Link from 'next/link';

export const AddGig = () => {
  const router = useRouter();
  const [date, setDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const gig = await createGigWithSetlist({
        title: formData.get('title') as string,
        venue: formData.get('venue') as string,
        address: formData.get('address') as string,
        date: date ? format(date, 'yyyy-MM-dd') : '',
        time: formData.get('time') as string,
        notes: formData.get('notes') as string
      });
      
      router.push(`/practice/gigs/${gig.id}`);
    } catch (error) {
      console.error('Error creating gig:', error);
      alert('Er is een fout opgetreden bij het aanmaken van de gig');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/practice/gigs"
          className={`inline-flex items-center gap-2 px-4 py-2 ${THEME.highlight} hover:bg-zinc-700 ${THEME.text} rounded-md font-medium transition-colors border ${THEME.border}`}
        >
          <ArrowLeft className="h-4 w-4" />
          Terug
        </Link>
        <h1 className="text-2xl font-bold">Nieuwe Gig Aanmaken</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gig Details</CardTitle>
          <CardDescription>Vul de informatie in voor de nieuwe gig</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                <Music className="inline h-4 w-4 mr-1" />
                Titel *
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="b.v. Zomerfestival 2024"
                required
                className="bg-zinc-800 text-white border-zinc-600 focus:border-rose-400 focus:ring-rose-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">
                <MapPin className="inline h-4 w-4 mr-1" />
                Locatie
              </Label>
              <Input
                id="venue"
                name="venue"
                placeholder="b.v. Paradiso"
                className="bg-zinc-800 text-white border-zinc-600 focus:border-rose-400 focus:ring-rose-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                <MapPin className="inline h-4 w-4 mr-1" />
                Adres
              </Label>
              <Input
                id="address"
                name="address"
                placeholder="b.v. Weteringschans 6-8, Amsterdam"
                className="bg-zinc-800 text-white border-zinc-600 focus:border-rose-400 focus:ring-rose-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  <CalendarIcon className="inline h-4 w-4 mr-1" />
                  Datum *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        "bg-zinc-800 text-white border-zinc-600 hover:bg-zinc-700 hover:border-rose-400",
                        !date && "text-zinc-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd MMM yyyy") : "Selecteer datum"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="bg-zinc-900 text-white border-zinc-700"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Tijd
                </Label>
                <Input
                  id="time"
                  name="time"
                  type="time"
                  className="bg-zinc-800 text-white border-zinc-600 focus:border-rose-400 focus:ring-rose-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notities</Label>
              <textarea
                id="notes"
                name="notes"
                className="w-full px-3 py-2 bg-zinc-800 text-white rounded-md border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-rose-400"
                rows={4}
                placeholder="Extra informatie over de gig..."
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/practice/gigs')}
                className={`flex-1 ${THEME.highlight} hover:bg-zinc-700 ${THEME.text} border-zinc-800`}
              >
                Annuleren
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !date}
                className={`flex-1 ${THEME.primaryBg} hover:${THEME.primaryBgDark} text-white`}
              >
                {isSubmitting ? (
                  <>
                    <PendingIcon />
                    <span className="ml-2">Bezig met aanmaken...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Gig Aanmaken
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};