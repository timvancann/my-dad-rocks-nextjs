'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IoCalendar, IoCalendarOutline, IoList, IoListOutline, IoMusicalNotes, IoMusicalNotesOutline, IoPlayCircle, IoPlayCircleOutline } from 'react-icons/io5';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  text: string;
}

export const Navbar = () => {
  const pathname = usePathname();
  const tabs: NavItem[] = [
    {
      href: '/',
      activeIcon: <IoMusicalNotes className="h-6 w-6 text-rosePine-love" />,
      icon: <IoMusicalNotesOutline className={'h-6 w-6'} />,
      text: 'Oefenlijst'
    },
    {
      href: '/repertoire',
      icon: <IoListOutline className={'h-6 w-6'} />,
      activeIcon: <IoList className="h-6 w-6 text-rosePine-love" />,
      text: 'Repertoire'
    },
    {
      href: '/gigs',
      icon: <IoCalendarOutline className={'h-6 w-6'} />,
      activeIcon: <IoCalendar className="h-6 w-6 text-rosePine-love" />,
      text: 'Optredens'
    },
    {
      href: '/player',
      icon: <IoPlayCircleOutline className={'h-6 w-6'} />,
      activeIcon: <IoPlayCircle className="h-6 w-6 text-rosePine-love" />,
      text: 'Speler'
    }
  ];
  return (
    <footer className="fixed inset-x-0 bottom-0 flex w-full flex-row rounded-t-2xl border-t border-rosePine-highlightMed bg-rosePine-base bg-opacity-80 p-1 backdrop-blur-md backdrop-filter">
      {tabs.map((tab, index) => (
        <NavbarTab key={tab.href} navItem={tab} index={index} isCurrent={pathname === tab.href} />
      ))}
    </footer>
  );
};

const NavbarTab = ({
  navItem,
  index,
  isCurrent
}: Readonly<{
  navItem: NavItem;
  index: number;
  isCurrent: boolean;
}>) => {
  return (
    <Link
      href={navItem.href}
      className={`x-2 flex w-full flex-col items-center justify-center py-1 text-rosePine-text ${isCurrent ? 'opacity-100' : 'opacity-80'} transition-all hover:opacity-100 ${index > 0 ? 'border-l border-rosePine-highlightMed' : ''}`}
    >
      <div className="flex flex-col items-center justify-center gap-1">
        {isCurrent ? navItem.activeIcon : navItem.icon}
        <div className={`text-[10px] ${isCurrent ? 'text-rosePine-love' : 'text-rosePine-text'}`}>{navItem.text}</div>
      </div>
    </Link>
  );
};
