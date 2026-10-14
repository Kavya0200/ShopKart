import { useEffect, useState } from 'react';

export default function ToastViewport() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const showToast = (event) => {
      const toast = event.detail;
      setToasts((current) => [...current, toast]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, 3600);
    };

    window.addEventListener('shopkart:toast', showToast);
    return () => window.removeEventListener('shopkart:toast', showToast);
  }, []);

  return (
    <div className="toast-viewport" aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => (
        <div className={`toast-message toast-${toast.type}`} key={toast.id} role={toast.type === 'error' ? 'alert' : 'status'}>
          <span aria-hidden="true">{toast.type === 'error' ? '🌷' : '✨'}</span>
          <p>{toast.message}</p>
          <button type="button" aria-label="Dismiss notification" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}>×</button>
        </div>
      ))}
    </div>
  );
}