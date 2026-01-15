'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Clock, MapPin, Music, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { THEME } from '@/themes';
import { GigType } from '@/lib/interface';
import { useUpdateGig } from '@/hooks/convex';
import type { Id } from '../../convex/_generated/dataModel';

interface EditGigProps {
  gig: GigType;
  onClose: () => void;
}

export const EditGig = ({ gig, onClose }: EditGigProps) => {
  const router = useRouter();
  const [date, setDate] = useState<Date>(new Date(gig.date));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: gig.title,
    venue: gig.venue || '',
    address: gig.address || '',
    time: gig.time || '',
    notes: (gig as any).notes || ''
  });

  const updateGig = useUpdateGig();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateGig({
        id: gig._id as Id<"gigs">,
        title: formData.title,
        venueName: formData.venue || undefined,
        venueAddress: formData.address || undefined,
        date: format(date, 'yyyy-MM-dd'),
        startTime: formData.time || undefined,
        notes: formData.notes || undefined
      });

      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error updating gig:', error);
      alert('Er is een fout opgetreden bij het bijwerken van de gig');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className={`w-full max-w-2xl rounded-lg ${THEME.highlight} border ${THEME.border} shadow-2xl`}>
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold">Gig Bewerken</h2>
          <button
            onClick={onClose}
            className="rounded-full bg-zinc-800/70 p-1.5 hover:bg-zinc-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              <Music className="inline h-4 w-4 mr-1" />
              Titel *
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
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
              value={formData.venue}
              onChange={handleChange}
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
              value={formData.address}
              onChange={handleChange}
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
                      "bg-zinc-800 text-white border-zinc-600 hover:bg-zinc-700 hover:border-rose-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "dd MMM yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
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
                value={formData.time}
                onChange={handleChange}
                className="bg-zinc-800 text-white border-zinc-600 focus:border-rose-400 focus:ring-rose-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notities</Label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-zinc-800 text-white rounded-md border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-rose-400"
              rows={4}
              placeholder="Extra informatie over de gig..."
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className={`flex-1 ${THEME.highlight} hover:bg-zinc-700 ${THEME.text} border-zinc-800`}
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 ${THEME.primaryBg} hover:${THEME.primaryBgDark} text-white`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Bezig met opslaan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Wijzigingen Opslaan
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
