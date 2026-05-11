import { useState, createContext, useContext, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toastConfig: Record<ToastType, { bg: string; border: string; icon: string; iconBg: string }> = {
  success: { bg: '#F0FDF4', border: '#86EFAC', icon: '✓', iconBg: '#1A7A4E' },
  error:   { bg: '#FEF2F2', border: '#FCA5A5', icon: '✕', iconBg: '#B03030' },
  info:    { bg: '#EFF6FF', border: '#93C5FD', icon: 'ℹ', iconBg: '#1B5FA6' },
  warning: { bg: '#FFFBEB', border: '#FCD34D', icon: '!', iconBg: '#C07A10' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  const value: ToastContextValue = {
    toast,
    success: (t, m) => toast('success', t, m),
    error:   (t, m) => toast('error', t, m),
    info:    (t, m) => toast('info', t, m),
    warning: (t, m) => toast('warning', t, m),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none" aria-live="polite">
        {toasts.map(t => {
          const c = toastConfig[t.type];
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-modal min-w-[280px] max-w-sm animate-slide-in-right"
              style={{ background: c.bg, border: `1px solid ${c.border}` }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                style={{ background: c.iconBg }}
              >
                {c.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary font-body">{t.title}</p>
                {t.message && <p className="text-xs text-text-secondary mt-0.5 font-body">{t.message}</p>}
              </div>
              <button
                onClick={() => remove(t.id)}
                className="text-text-muted hover:text-text-secondary text-xs ml-1 flex-shrink-0"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
