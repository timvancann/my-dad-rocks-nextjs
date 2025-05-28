'use client';

import { useRouter } from 'next/navigation';
import { useState, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationButtonProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  icon?: ReactNode;
  rightContent?: ReactNode;
}

export function NavigationButton({ 
  href, 
  children, 
  className = '', 
  onClick,
  icon,
  rightContent
}: NavigationButtonProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = () => {
    setIsNavigating(true);
    onClick?.();
    router.push(href);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isNavigating}
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-sm transition-all',
        isNavigating && 'opacity-75 cursor-wait',
        className
      )}
    >
      <span className="flex items-center gap-2">
        {isNavigating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          icon
        )}
        {children}
      </span>
      {rightContent}
    </button>
  );
}

interface NavigationLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export function NavigationLink({ 
  href, 
  children, 
  className = '', 
  icon
}: NavigationLinkProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsNavigating(true);
    router.push(href);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-2 transition-all',
        isNavigating && 'opacity-75 cursor-wait pointer-events-none',
        className
      )}
    >
      {isNavigating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        icon
      )}
      {children}
    </a>
  );
}