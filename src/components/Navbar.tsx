'use client';
import { THEME } from '@/themes';
import { Calendar, Home, ListMusic, Music4 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserProfile } from './UserProfile';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  text: string;
}

export const Navbar = () => {
  const pathname = usePathname();

  const tabs: NavItem[] = [
    {
      href: '/practice',
      icon: <Home />,
      text: 'Oefenlijst'
    },
    {
      href: '/practice/repertoire',
      icon: <ListMusic />,
      text: 'Repertoire'
    },
    {
      href: '/practice/gigs',
      icon: <Calendar />,
      text: 'Optredens'
    },
    {
      href: '/practice/player',
      icon: <Music4 />,
      text: 'Speler'
    }
  ];

  return (
    <nav className={`${THEME.card} border-t ${THEME.border} z-40 flex justify-around py-2 shadow-lg`}>
      {tabs.map((tab, index) => (
        <NavItem key={index} url={tab.href} icon={tab.icon} label={tab.text} active={pathname === tab.href} theme={THEME} />
      ))}
    </nav>
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
