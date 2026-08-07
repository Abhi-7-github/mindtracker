import React from 'react';
import { cn } from '../../utils/cn';

export const AudioWaveform = ({ isRecording, className }) => {
  const bars = [0.4, 0.8, 1, 0.6, 0.9, 0.5, 0.7, 1, 0.6, 0.8, 0.4, 0.9, 0.5];

  return (
    <div className={cn("flex items-center justify-center space-x-1.5 h-16 p-4 bg-white rounded-2xl polo-border polo-shadow", className)}>
      {bars.map((scale, i) => (
        <span
          key={i}
          className={cn(
            "w-2 bg-[#B82126] rounded-full transition-all duration-150 polo-border border-black",
            isRecording ? "animate-wave-bar" : "h-4 opacity-40"
          )}
          style={{
            height: isRecording ? '100%' : '16px',
            animationDelay: `${(i % 5) * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
};
