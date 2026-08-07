import React from 'react';
import { cn } from '../../utils/cn';

export const Input = React.forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  className,
  type = 'text',
  ...props
}, ref) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            "w-full bg-white text-black px-4 py-3 text-sm rounded-xl font-medium placeholder:text-neutral-400 focus:outline-none transition-all duration-150 polo-border focus:shadow-[4px_4px_0px_0px_#9F1239]",
            Icon && "pl-10",
            error && "border-red-600 focus:shadow-[4px_4px_0px_0px_#DC2626]",
            className
          )}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs font-semibold text-red-600 mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-neutral-500 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
