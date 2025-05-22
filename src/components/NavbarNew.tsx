'use client';
import { THEME } from '@/themes';
import { Calendar, Home, ListMusic, Music4 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserProfile } from './UserProfile';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  text: string;
}

export const NavbarNew = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const tabs: NavItem[] = [
    {
      href: '/',
      icon: <Home />,
      text: 'Oefenlijst'
    },
    {
      href: '/repertoire',
      icon: <ListMusic />,
      text: 'Repertoire'
    },
    {
      href: '/gigs',
      icon: <Calendar />,
      text: 'Optredens'
    },
    {
      href: '/player',
      icon: <Music4 />,
      text: 'Speler'
    }
  ];
  
  // If not authenticated, don't render the navbar
  if (!session) {
    return null;
  }
  
  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <UserProfile />
      </div>
      <nav className={`${THEME.card} border-t ${THEME.border} z-40 flex justify-around py-2 shadow-lg`}>
        {tabs.map((tab, index) => (
          <NavItem key={index} url={tab.href} icon={tab.icon} label={tab.text} active={pathname === tab.href} theme={THEME} />
        ))}
      </nav>
    </>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  url: string;
  theme: any;
}

const NavItem = ({ icon, label, active, url, theme }: NavItemProps) => {
  return (
    <Link href={url} className={`relative flex grow flex-col items-center justify-center border-x-[1px] ${theme.border}`}>
      {active && <div className="absolute -top-1.5 left-1/2 h-0.5 w-12 -translate-x-1/2 transform rounded bg-gradient-to-r from-red-600/0 via-amber-400 to-red-600/0"></div>}
      <div className={`p-1 ${active ? theme.secondary : theme.textSecondary}`}>{icon}</div>
      <span className={`text-xs ${active ? theme.secondary : theme.textSecondary}`}>{label}</span>
    </Link>
  );
};