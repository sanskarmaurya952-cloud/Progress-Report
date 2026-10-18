import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'secondary' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  className = '',
  icon,
}) => {
  const variantStyles = {
    primary: 'bg-uplivo-primary/20 text-uplivo-primary-light border-uplivo-primary/30',
    accent: 'bg-uplivo-accent/20 text-uplivo-accent border-uplivo-accent/30',
    success: 'bg-uplivo-success/15 text-uplivo-success border-uplivo-success/30',
    warning: 'bg-uplivo-warning/15 text-uplivo-warning border-uplivo-warning/30',
    error: 'bg-uplivo-error/15 text-uplivo-error border-uplivo-error/30',
    secondary: 'bg-uplivo-card text-uplivo-text-secondary border-uplivo-border',
    outline: 'bg-transparent text-uplivo-text-secondary border-uplivo-border',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 rounded gap-1',
    md: 'text-xs px-2.5 py-1 rounded-md gap-1.5 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
