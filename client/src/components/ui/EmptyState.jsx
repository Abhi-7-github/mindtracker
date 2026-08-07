import React from 'react';
import { cn } from '../../utils/cn';
import { Button } from './Button';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There is no data available to display right now.',
  actionLabel,
  onAction,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl polo-border polo-shadow", className)}>
      <div className="p-4 bg-neutral-100 rounded-2xl polo-border mb-4">
        <Icon className="w-8 h-8 text-[#9F1239]" />
      </div>
      <h4 className="text-lg font-black uppercase text-black">{title}</h4>
      <p className="text-sm font-medium text-neutral-600 mt-1 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-5" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
