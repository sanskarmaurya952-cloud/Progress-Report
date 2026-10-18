import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hover = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-uplivo-card border border-uplivo-border rounded-xl shadow-lg shadow-black/20 overflow-hidden ${
        hover
          ? 'hover:border-uplivo-border/80 hover:shadow-xl hover:shadow-uplivo-primary/5 transition-all duration-200'
          : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}> = ({ title, subtitle, action, className = '', children }) => {
  if (children) {
    return <div className={`p-5 border-b border-uplivo-border/60 ${className}`}>{children}</div>;
  }

  return (
    <div className={`p-5 border-b border-uplivo-border/60 flex items-start justify-between gap-4 ${className}`}>
      <div>
        {title && <h3 className="font-semibold text-lg text-uplivo-text">{title}</h3>}
        {subtitle && <p className="text-sm text-uplivo-text-secondary mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return <div className={`p-5 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`p-4 bg-uplivo-surface/40 border-t border-uplivo-border/60 flex items-center justify-between text-sm ${className}`}>
      {children}
    </div>
  );
};
