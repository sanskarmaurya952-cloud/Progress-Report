import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-uplivo-primary focus:ring-offset-2 focus:ring-offset-uplivo-bg disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variantStyles = {
    primary:
      'bg-uplivo-primary hover:bg-uplivo-primary-hover text-white shadow-md shadow-uplivo-primary/20 active:scale-[0.98]',
    secondary:
      'bg-uplivo-surface hover:bg-uplivo-card text-uplivo-text border border-uplivo-border active:scale-[0.98]',
    outline:
      'border border-uplivo-primary/60 text-uplivo-primary-light hover:bg-uplivo-primary/10 hover:border-uplivo-primary active:scale-[0.98]',
    ghost:
      'text-uplivo-text-secondary hover:text-uplivo-text hover:bg-uplivo-surface/70 active:scale-[0.98]',
    danger:
      'bg-uplivo-error/90 hover:bg-uplivo-error text-white shadow-sm shadow-uplivo-error/20 active:scale-[0.98]',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-md gap-1.5',
    md: 'text-sm px-4 py-2 rounded-lg gap-2',
    lg: 'text-base px-6 py-2.5 rounded-lg gap-2.5 font-semibold',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          {children && <span>{children}</span>}
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};
