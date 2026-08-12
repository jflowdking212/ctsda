'use client';

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// ─── Icons ───────────────────────────────────────────────────────────────────
const icons: Record<ToastType, React.ReactNode> = {
  success: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" fill="currentColor" fillOpacity=".15" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 10l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" fill="currentColor" fillOpacity=".15" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M9.13 3.5L2.2 15.5A1 1 0 003.07 17h13.86a1 1 0 00.87-1.5L10.87 3.5a1 1 0 00-1.74 0z" fill="currentColor" fillOpacity=".15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M10 8v4M10 13.5v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" fill="currentColor" fillOpacity=".15" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 9v5M10 6.5v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
};

const palette: Record<ToastType, { accent: string; bg: string; title: string; sub: string; bar: string }> = {
  success: { accent: '#22c55e', bg: '#0f172a', title: '#f0fdf4', sub: '#bbf7d0', bar: '#22c55e' },
  error:   { accent: '#f43f5e', bg: '#0f172a', title: '#fff1f2', sub: '#fecdd3', bar: '#f43f5e' },
  warning: { accent: '#f59e0b', bg: '#0f172a', title: '#fffbeb', sub: '#fde68a', bar: '#f59e0b' },
  info:    { accent: '#3b82f6', bg: '#0f172a', title: '#eff6ff', sub: '#bfdbfe', bar: '#3b82f6' },
};

// ─── Single Toast Card ────────────────────────────────────────────────────────
function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const p = palette[toast.type];

  React.useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => dismiss(), 4500);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    setLeaving(true);
    setTimeout(() => onDismiss(toast.id), 350);
  }

  return (
    <div
      onClick={dismiss}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.9rem 1rem 0.9rem 1rem',
        borderRadius: '0.875rem',
        background: p.bg,
        border: `1px solid ${p.accent}33`,
        boxShadow: `0 8px 32px #00000055, 0 0 0 1px ${p.accent}22, inset 0 1px 0 ${p.accent}18`,
        backdropFilter: 'blur(20px)',
        cursor: 'pointer',
        minWidth: '320px',
        maxWidth: '400px',
        overflow: 'hidden',
        transform: visible && !leaving ? 'translateX(0) scale(1)' : 'translateX(110%) scale(0.95)',
        opacity: visible && !leaving ? 1 : 0,
        transition: 'transform 0.35s cubic-bezier(.21,1.02,.73,1), opacity 0.35s ease',
      }}
    >
      {/* Left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
        background: p.bar, borderRadius: '3px 0 0 3px',
      }} />

      {/* Icon */}
      <div style={{ color: p.accent, marginTop: '1px', flexShrink: 0, marginLeft: '4px' }}>
        {icons[toast.type]}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: p.title, lineHeight: 1.3, marginBottom: toast.message ? '0.2rem' : 0 }}>
          {toast.title}
        </div>
        {toast.message && (
          <div style={{ fontSize: '0.78rem', color: p.sub, lineHeight: 1.5 }}>
            {toast.message}
          </div>
        )}
      </div>

      {/* Close */}
      <button
        onClick={e => { e.stopPropagation(); dismiss(); }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
          color: '#64748b', flexShrink: 0, marginTop: '-1px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        aria-label="Dismiss"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
        background: `${p.accent}22`,
      }}>
        <div style={{
          height: '100%', background: p.bar, borderRadius: '0 0 1px 1px',
          animation: visible ? 'toast-progress 4.5s linear forwards' : 'none',
        }} />
      </div>

      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

// ─── Container ────────────────────────────────────────────────────────────────
function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem',
      zIndex: 99999, display: 'flex', flexDirection: 'column', gap: '0.6rem',
      alignItems: 'flex-end', pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <ToastCard toast={t} onDismiss={dismiss} />
        </div>
      ))}
    </div>,
    document.body
  );
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `toast-${++counterRef.current}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
  }, []);

  const ctx: ToastContextValue = {
    toast,
    success: (title, msg) => toast('success', title, msg),
    error:   (title, msg) => toast('error', title, msg),
    warning: (title, msg) => toast('warning', title, msg),
    info:    (title, msg) => toast('info', title, msg),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}
