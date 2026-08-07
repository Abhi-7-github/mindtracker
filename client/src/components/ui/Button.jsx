import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  icon: Icon,
  onClick,
  ...props
}, ref) => {

  const baseStyles = "inline-flex items-center justify-center font-bold tracking-wide uppercase transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none polo-btn-press";

  const variants = {
    primary: "bg-[#9F1239] text-white hover:bg-[#8A181C] polo-border polo-shadow",
    secondary: "bg-black text-white hover:bg-neutral-800 polo-border polo-shadow-red",
    outline: "bg-white text-black hover:bg-neutral-100 polo-border polo-shadow",
    ghost: "bg-transparent text-black hover:bg-neutral-200 border-2 border-transparent",
    danger: "bg-red-600 text-white hover:bg-red-700 polo-border polo-shadow",
    glass: "polo-glass text-black hover:bg-white/90 polo-shadow",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-md",
    md: "px-5 py-2.5 text-sm rounded-lg",
    lg: "px-7 py-3.5 text-base rounded-xl",
    icon: "p-2.5 rounded-lg",
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 mr-2" />
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
