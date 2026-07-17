import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: 600,
    borderRadius: '0.375rem',
    border: 'none',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.6 : 1,
    transition: 'all 0.2s',
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '0.375rem 0.75rem', fontSize: '0.875rem' },
    md: { padding: '0.5rem 1rem', fontSize: '1rem' },
    lg: { padding: '0.75rem 1.5rem', fontSize: '1.125rem' },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: '#1a365d', color: 'white' },
    secondary: { backgroundColor: '#e2e8f0', color: '#1a202c' },
    outline: { backgroundColor: 'transparent', color: '#1a365d', border: '2px solid #1a365d' },
    ghost: { backgroundColor: 'transparent', color: '#4a5568' },
    danger: { backgroundColor: '#e53e3e', color: 'white' },
  };

  return (
    <button
      style={{ ...baseStyle, ...sizeStyles[size], ...variantStyles[variant], ...style }}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span>Loading...</span>}
      {children}
    </button>
  );
}