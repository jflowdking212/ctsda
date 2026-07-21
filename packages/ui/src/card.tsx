import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered' | 'premium';
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  const baseClasses = 'rounded-xl transition-all duration-300';
  
  const variantClasses: Record<string, string> = {
    default: 'bg-white border border-line shadow-sm p-6',
    elevated: 'bg-white p-6 shadow-lg hover:shadow-xl',
    bordered: 'bg-white p-6 border-2 border-line hover:border-emerald-500',
    premium: 'bg-white p-8 shadow-premium border border-line relative overflow-hidden',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {variant === 'premium' && (
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-emerald-600" />
      )}
      <div className={variant === 'premium' ? 'pl-4' : ''}>
        {children}
      </div>
    </div>
  );
}