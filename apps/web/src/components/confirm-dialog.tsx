'use client';

import React from 'react';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const config = {
    danger: {
      bgIcon: '#fef2f2',
      borderIcon: '#fee2e2',
      iconColor: '#dc2626',
      btnBg: '#dc2626',
      btnHover: '#b91c1c',
      btnColor: '#ffffff',
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      )
    },
    warning: {
      bgIcon: '#fffbeb',
      borderIcon: '#fef3c7',
      iconColor: '#d97706',
      btnBg: '#d97706',
      btnHover: '#b45309',
      btnColor: '#ffffff',
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      )
    },
    success: {
      bgIcon: '#ecfdf5',
      borderIcon: '#d1fae5',
      iconColor: '#059669',
      btnBg: '#059669',
      btnHover: '#047857',
      btnColor: '#ffffff',
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      )
    },
    primary: {
      bgIcon: '#eff6ff',
      borderIcon: '#dbeafe',
      iconColor: '#1d4ed8',
      btnBg: '#10233f',
      btnHover: '#1e3a8a',
      btnColor: '#ffffff',
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      )
    }
  }[variant];

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(16, 35, 63, 0.65)',
        backdropFilter: 'blur(6px)',
        padding: '1.25rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(16, 35, 63, 0.25), 0 0 0 1px rgba(16, 35, 63, 0.08)',
          width: '100%',
          maxWidth: '460px',
          overflow: 'hidden',
          animation: 'ctsdaModalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <style>{`
          @keyframes ctsdaModalIn {
            from { opacity: 0; transform: scale(0.96) translateY(8px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* Modal Content */}
        <div style={{ padding: '1.75rem 1.75rem 1.25rem 1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: config.bgIcon,
                border: `1px solid ${config.borderIcon}`,
              }}
            >
              {config.svg}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: '#10233f',
                  margin: '0 0 0.5rem 0',
                  lineHeight: 1.3,
                  letterSpacing: '-0.01em',
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontSize: '0.885rem',
                  color: '#5d6a7c',
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.75rem 1.5rem 1.75rem',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #edf2f7',
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '0.625rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: '8px',
              border: '1px solid #dde5ee',
              backgroundColor: '#ffffff',
              color: '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#f1f5f9';
              (e.currentTarget as HTMLElement).style.borderColor = '#cbd5e1';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#ffffff';
              (e.currentTarget as HTMLElement).style.borderColor = '#dde5ee';
            }}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: '0.625rem 1.35rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              backgroundColor: config.btnBg,
              color: config.btnColor,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = config.btnHover;
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = config.btnBg;
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
