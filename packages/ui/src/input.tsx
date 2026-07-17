import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, style, ...props }: InputProps) {
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    fontSize: '1rem',
    border: `1px solid ${error ? '#e53e3e' : '#cbd5e0'}`,
    borderRadius: '0.375rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    backgroundColor: 'white',
    ...style,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      {label && (
        <label style={{ fontWeight: 500, fontSize: '0.875rem', color: '#4a5568' }}>
          {label}
        </label>
      )}
      <input style={inputStyle} {...props} />
      {error && <span style={{ fontSize: '0.75rem', color: '#e53e3e' }}>{error}</span>}
      {helperText && !error && (
        <span style={{ fontSize: '0.75rem', color: '#718096' }}>{helperText}</span>
      )}
    </div>
  );
}