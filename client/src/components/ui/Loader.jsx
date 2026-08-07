import React from 'react';
import { cn } from '../../utils/cn';

export const Loader = ({ text = 'Analyzing...', className }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 space-y-4", className)}>
      <div className="flex items-center space-x-1.5 h-10">
        <span className="w-2.5 bg-[#B82126] rounded-full h-full animate-wave-bar polo-border" style={{ animationDelay: '0s' }} />
        <span className="w-2.5 bg-black rounded-full h-full animate-wave-bar polo-border" style={{ animationDelay: '0.2s' }} />
        <span className="w-2.5 bg-[#B82126] rounded-full h-full animate-wave-bar polo-border" style={{ animationDelay: '0.4s' }} />
        <span className="w-2.5 bg-black rounded-full h-full animate-wave-bar polo-border" style={{ animationDelay: '0.6s' }} />
      </div>
      {text && <p className="text-sm font-black uppercase tracking-wider text-black">{text}</p>}
    </div>
  );
};
