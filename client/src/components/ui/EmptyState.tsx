import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-uplivo-border rounded-xl bg-uplivo-surface/30 ${className}`}
    >
      {icon && (
        <div className="p-3.5 mb-4 rounded-2xl bg-uplivo-card border border-uplivo-border text-uplivo-primary-light">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-uplivo-text mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-uplivo-text-secondary max-w-sm mb-6">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};
