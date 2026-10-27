import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (type, message) => {
      const id = nextId++;
      setToasts((current) => [...current, { id, type, message }]);
      setTimeout(() => remove(id), 4000); // disappears after 4 seconds
    },
    [remove]
  );

  const toast = useMemo(
    () => ({
      success: (message) => show('success', message),
      error: (message) => show('error', message),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} role="status">
            <span className="toast-dot" />
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => remove(t.id)} aria-label="Dismiss">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
