import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
}

let toastCounter = 0;
const toasts: Toast[] = [];
let updateListeners: (() => void)[] = [];

export const showToast = (toast: Omit<Toast, 'id'>) => {
  const id = `toast-${++toastCounter}`;
  toasts.push({ ...toast, id });
  updateListeners.forEach(listener => listener());
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    const index = toasts.findIndex(t => t.id === id);
    if (index > -1) {
      toasts.splice(index, 1);
      updateListeners.forEach(listener => listener());
    }
  }, 5000);
};

export const SimpleToast: React.FC = () => {
  const [, forceUpdate] = useState({});
  
  useEffect(() => {
    const listener = () => forceUpdate({});
    updateListeners.push(listener);
    return () => {
      updateListeners = updateListeners.filter(l => l !== listener);
    };
  }, []);
  
  const removeToast = (id: string) => {
    const index = toasts.findIndex(t => t.id === id);
    if (index > -1) {
      toasts.splice(index, 1);
      forceUpdate({});
    }
  };
  
  if (toasts.length === 0) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      maxWidth: '420px',
      width: '100%',
      pointerEvents: 'none'
    }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          style={{
            backgroundColor: toast.variant === 'destructive' ? '#dc2626' : 
                           toast.variant === 'success' ? '#10b981' : 'white',
            color: toast.variant ? 'white' : 'black',
            border: `1px solid ${toast.variant === 'destructive' ? '#dc2626' : 
                               toast.variant === 'success' ? '#10b981' : '#ccc'}`,
            borderRadius: '0.375rem',
            padding: '1rem',
            paddingRight: '2.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            pointerEvents: 'auto',
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <div>
            {toast.title && <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{toast.title}</div>}
            {toast.description && <div style={{ fontSize: '0.875rem' }}>{toast.description}</div>}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem',
              color: toast.variant ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)'
            }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};