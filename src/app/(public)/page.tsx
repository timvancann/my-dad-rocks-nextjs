// src/app/page.tsx
import { getPublicGigs } from '@/actions/supabase';
import { CalendarIcon, MapPinIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { EnvelopeIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { THEME } from '@/themes';
import { YoutubeIcon } from 'lucide-react';

export default async function PublicPage() {
  const upcomingGigs = await getPublicGigs();

  return (
    <div className={`min-h-screen ${THEME.bg} ${THEME.text}`}>
      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-20 overflow-hidden">
        {/* Background gradient animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-gray-900/30 to-black/40"></div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-500/30 rounded-full animate-bounce delay-0"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-red-400/40 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-red-600/20 rounded-full animate-bounce delay-2000"></div>
        </div>

        <div className="text-center relative z-10">
          <h1 className={`mb-4 text-6xl font-bold tracking-tight ${THEME.text} md:text-8xl transform hover:scale-105 transition-transform duration-300 bg-gradient-to-r from-red-500 via-red-400 to-red-600 bg-clip-text text-transparent`}>
            My Dad Rocks
          </h1>
          <p className={`mb-8 text-xl ${THEME.textSecondary} md:text-2xl font-light italic`}>
            🎸 De beste dad-rock covers! 🎸
          </p>
          <div className={`flex items-center justify-center gap-2 text-lg ${THEME.secondary} hover:${THEME.primary} transition-colors duration-300`}>
            <MapPinIcon className="h-5 w-5" />
            <span>Zaltbommel, Nederland</span>
          </div>
        </div>

        {/* Hero Image with enhanced styling */}
        <div className={`mt-12 h-64 max-w-2xl overflow-hidden shadow-2xl md:h-80 rounded-2xl border-4 border-red-600/50 hover:border-red-500 transition-all duration-300 hover:scale-105 hover:shadow-red-500/25`}>
          <Image
            src="/promo/logo_transparent.png"
            alt="My Dad Rocks band photo"
            width={800}
            height={400}
            className="h-full w-full object-cover filter hover:brightness-110 transition-all duration-300"
          />
        </div>

        {/* Call to action buttons */}
        <div className="mt-8 flex gap-4 flex-wrap justify-center">
          <a
            href="https://www.youtube.com/@MyDadRocks-jh6of"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-red-500/50`}
          >
            <YoutubeIcon className="h-5 w-5" />
            YouTube
          </a>
          <a
            href="mailto:booking@mydadrocks.nl"
            className={`flex items-center gap-2 px-6 py-3 border-2 border-red-600 text-red-500 hover:bg-red-600 hover:text-white rounded-full font-semibold transform hover:scale-105 transition-all duration-300`}
          >
            <EnvelopeIcon className="h-5 w-5" />
            Boek ons nu!
          </a>
        </div>
      </section>

      {/* About Section */}
      <section className="px-6 py-16 relative">
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <SparklesIcon className={`h-8 w-8 ${THEME.primary}`} />
            <h2 className={`text-4xl font-bold ${THEME.secondary} bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent`}>Over de Band</h2>
            <SparklesIcon className={`h-8 w-8 ${THEME.primary}`} />
          </div>
          <div className={`space-y-6 text-lg leading-relaxed ${THEME.text}`}>
            <div className={`p-6 rounded-xl bg-gradient-to-r from-red-900/10 to-gray-900/10 border border-red-600/20 hover:border-red-500/40 transition-all duration-300 transform hover:scale-105`}>
              <p className="font-medium">
                🎵 My Dad Rocks brengt je het beste in classic en modern rock, met covers van alles
                van tijdloze anthems die je terugbrengen naar het gouden tijdperk van rock. 🎵
              </p>
            </div>
            <div className={`p-6 rounded-xl bg-gradient-to-l from-red-900/10 to-gray-900/10 border border-red-600/20 hover:border-red-500/40 transition-all duration-300 transform hover:scale-105`}>
              <p className="font-medium">
                🏠 Gevestigd in Zaltbommel, zijn wij gepassioneerde muzikanten die zich richten op het leveren
                van authentieke, energieke optredens die de muziek vieren waar we allemaal mee zijn opgegroeid. 🎸
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Gigs Section */}
      {upcomingGigs.length > 0 && (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className={`mb-12 text-center text-4xl font-bold ${THEME.secondary}`}>
              Komende Optredens
            </h2>
            <div className="space-y-6">
              {upcomingGigs.map((gig) => (
                <div
                  key={gig._id}
                  className={`rounded-xl ${THEME.border} ${THEME.card} p-6 shadow-lg transition-all hover:border-red-600 hover:shadow-xl hover:shadow-red-500/25 border transform hover:scale-105 bg-gradient-to-r from-red-900/5 to-gray-900/5`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`rounded-full ${THEME.primaryBg}/20 p-3`}>
                        <CalendarIcon className={`h-6 w-6 ${THEME.primary}`} />
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold ${THEME.text}`}>
                          {gig.title}
                        </h3>
                        <p className={THEME.textSecondary}>
                          {new Date(gig.date).toLocaleDateString('nl-NL', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                        {gig.address && (
                          <div className={`mt-2 flex items-center gap-2 ${THEME.secondary}`}>
                            <MapPinIcon className="h-4 w-4" />
                            <span className="text-sm">{gig.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="px-6 py-16 relative">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className={`mb-12 text-4xl font-bold ${THEME.secondary} bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent`}>🔥 Rooksignalen 🔥</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className={`rounded-xl ${THEME.border} ${THEME.card} p-8 border transform hover:scale-105 transition-all duration-300 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/25 bg-gradient-to-br from-red-900/10 to-gray-900/10`}>
              <div className="mb-4 flex justify-center">
                <div className={`rounded-full ${THEME.primaryBg}/20 p-4`}>
                  <EnvelopeIcon className={`h-8 w-8 ${THEME.primary}`} />
                </div>
              </div>
              <h3 className={`mb-2 text-xl font-bold ${THEME.text}`}>📧 Email</h3>
              <a
                href="mailto:booking@mydadrocks.nl"
                className={`${THEME.secondary} transition-colors hover:${THEME.primary} font-semibold text-lg`}
              >
                booking@mydadrocks.nl
              </a>
            </div>

            <div className={`rounded-xl ${THEME.border} ${THEME.card} p-8 border transform hover:scale-105 transition-all duration-300 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/25 bg-gradient-to-bl from-red-900/10 to-gray-900/10`}>
              <div className="mb-4 flex justify-center">
                <div className={`rounded-full ${THEME.primaryBg}/20 p-4`}>
                  <YoutubeIcon className={`h-8 w-8 ${THEME.primary}`} />
                </div>
              </div>
              <h3 className={`mb-2 text-xl font-bold ${THEME.text}`}>🎬 YouTube</h3>
              <a
                href="https://www.youtube.com/@MyDadRocks-jh6of"
                target="_blank"
                rel="noopener noreferrer"
                className={`${THEME.secondary} transition-colors hover:${THEME.primary} font-semibold text-lg`}
              >
                @MyDadRocks-jh6of
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${THEME.border} ${THEME.card} px-6 py-8 border-t`}>
        <div className="mx-auto max-w-4xl text-center">
          <p className={THEME.textSecondary}>
            © 2025 My Dad Rocks. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
