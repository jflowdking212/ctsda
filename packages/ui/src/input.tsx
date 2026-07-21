import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className = '', ...props }: InputProps) {
  const baseClasses = 'w-full px-4 py-2.5 text-base border rounded-lg outline-none transition-all duration-200 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500';
  
  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-line';

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="font-medium text-sm text-muted">
          {label}
        </label>
      )}
      <input className={`${baseClasses} ${errorClasses} ${className}`} {...props} />
      {error && (
        <span className="text-xs text-red-600 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </span>
      )}
      {helperText && !error && (
        <span className="text-xs text-muted">{helperText}</span>
      )}
    </div>
  );
}