'use client';
import Link from 'next/link';
import { MusicalNoteIcon, CalendarIcon, QueueListIcon } from '@heroicons/react/16/solid';
import { usePathname } from 'next/navigation';
import {
  IoCalendar,
  IoCalendarOutline,
  IoList,
  IoListOutline,
  IoMusicalNotes,
  IoMusicalNotesOutline
} from 'react-icons/io5';

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
      activeIcon: <IoMusicalNotes className=" text-rosePine-love h-6 w-6" />,
      icon: <IoMusicalNotesOutline className={'h-6 w-6'} />,
      text: 'Oefenlijst'
    },
    {
      href: '/repertoire',
      icon: <IoListOutline className={'h-6 w-6'} />,
      activeIcon: <IoList className=" text-rosePine-love h-6 w-6" />,
      text: 'Repertoire'
    },
    {
      href: '/gigs',
      icon: <IoCalendarOutline className={'h-6 w-6'} />,
      activeIcon: <IoCalendar className=" text-rosePine-love h-6 w-6" />,
      text: 'Gigs'
    }
  ];
  console.log(pathname);
  return (
    <footer
      className="flex flex-row fixed inset-x-0 bottom-0 w-full bg-rosePine-base bg-opacity-80 backdrop-blur-md backdrop-filter border-t border-rosePine-highlightMed p-1 rounded-t-2xl ">
      {tabs.map((tab, index) => (
        <NavbarTab key={tab.href} navItem={tab} index={index} isCurrent={pathname === tab.href} />
      ))}
    </footer>
  );
};

const NavbarTab = (
  {
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
      className={
        `flex flex-col items-center justify-center w-full x-2 py-1 text-rosePine-text 
      ${isCurrent ? 'opacity-100' : 'opacity-80 '} hover:opacity-100 transition-all 
      ${index > 0 ? 'border-l border-rosePine-highlightMed' : ''}`}
    >
      <div className="flex flex-col items-center justify-center gap-1">
          {isCurrent? navItem.activeIcon : navItem.icon}
        <div className={`text-[10px] ${isCurrent ? "text-rosePine-love": "text-rosePine-text"}`}>{navItem.text}</div>
      </div>
    </Link>
  );
};
