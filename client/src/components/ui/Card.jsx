import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({ children, className, dark = false, ...props }) => {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 transition-all duration-200",
        dark 
          ? "bg-[#1A1A1A] text-white polo-border-dark shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]" 
          : "bg-white text-black polo-border polo-shadow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
