import React from 'react';
import { cn } from '../../utils/cn';

export const GlassCard = ({ children, className, dark = false, ...props }) => {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 transition-all duration-200",
        dark ? "polo-glass-dark text-white" : "polo-glass text-black polo-shadow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
