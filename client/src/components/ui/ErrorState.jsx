import React from 'react';
import { cn } from '../../utils/cn';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export const ErrorState = ({
  title = 'Something went wrong',
  description = 'An error occurred while fetching data. Please try again.',
  onRetry,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-2xl border-2 border-red-600 polo-shadow", className)}>
      <div className="p-3 bg-red-600 text-white rounded-xl polo-border mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h4 className="text-lg font-black uppercase text-red-900">{title}</h4>
      <p className="text-sm font-medium text-red-700 mt-1 max-w-md">{description}</p>
      {onRetry && (
        <Button variant="danger" onClick={onRetry} className="mt-4" size="sm">
          Retry Action
        </Button>
      )}
    </div>
  );
};
