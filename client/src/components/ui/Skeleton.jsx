import React from 'react';
import { cn } from '../../utils/cn';

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse bg-neutral-300 rounded-xl polo-border border-neutral-400", className)}
      {...props}
    />
  );
};
