import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  style?: React.CSSProperties;
}

export function Badge({ children, variant = 'default', style }: BadgeProps) {
  const variantStyles: Record<string, React.CSSProperties> = {
    default: { backgroundColor: '#e2e8f0', color: '#1a202c' },
    success: { backgroundColor: '#c6f6d5', color: '#22543d' },
    warning: { backgroundColor: '#fefcbf', color: '#744210' },
    error: { backgroundColor: '#fed7d7', color: '#822727' },
    info: { backgroundColor: '#bee3f8', color: '#2a4365' },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.125rem 0.5rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        borderRadius: '9999px',
        whiteSpace: 'nowrap',
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
}