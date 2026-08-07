import React from 'react';
import { cn } from '../../utils/cn';

export const Avatar = ({ src, name = 'User', size = 'md', className, status }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  const getInitials = (str) => {
    if (!str) return 'U';
    return str
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          "rounded-full overflow-hidden flex items-center justify-center font-black bg-[#B82126] text-white polo-border flex-shrink-0",
          sizes[size],
          className
        )}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-black",
            status === 'online' ? 'bg-emerald-500' : 'bg-neutral-400'
          )}
        />
      )}
    </div>
  );
};
