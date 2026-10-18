import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, iconRight, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-uplivo-text-secondary uppercase tracking-wider mb-1.5">
            {label}
            {props.required && <span className="text-uplivo-primary ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-uplivo-text-muted">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-uplivo-surface text-uplivo-text placeholder-uplivo-text-muted text-sm rounded-lg border transition-all duration-150 py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-uplivo-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
              icon ? 'pl-10' : ''
            } ${iconRight ? 'pr-10' : ''} ${
              error
                ? 'border-uplivo-error focus:ring-uplivo-error'
                : 'border-uplivo-border hover:border-uplivo-border/80'
            } ${className}`}
            {...props}
          />
          {iconRight && (
            <div className="absolute right-3.5 flex items-center text-uplivo-text-muted">
              {iconRight}
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-uplivo-error font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-uplivo-text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
