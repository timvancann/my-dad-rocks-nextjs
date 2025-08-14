'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchInputProps extends Omit<React.ComponentProps<'input'>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onChange, placeholder = 'Search...', ...props }, ref) => {
    const handleClear = () => {
      onChange('');
    };

    return (
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-10 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            className
          )}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          ref={ref}
          {...props}
        />
        {value && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export { SearchInput };