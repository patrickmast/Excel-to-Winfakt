import React from 'react';
import { useToast } from 'pm7-ui-style-guide';

export function TestToast() {
  const { toast, toasts, dismiss } = useToast();
  
  React.useEffect(() => {
    console.log('[TestToast] Current toasts:', toasts);
    toasts.forEach(t => {
      console.log('[TestToast] Toast details:', {
        id: t.id,
        title: t.title,
        description: t.description,
        open: t.open,
        variant: t.variant
      });
    });
  }, [toasts]);
  
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 99999, background: 'yellow', padding: '10px', maxWidth: '400px' }}>
      <div>Toasts count: {toasts.length}</div>
      <button 
        onClick={() => {
          console.log('[TestToast] Creating toast...');
          const result = toast({
            title: "Test from TestToast " + Date.now(),
            description: "This is a test",
            variant: "default"
          });
          console.log('[TestToast] Toast created:', result);
        }}
        style={{ background: 'blue', color: 'white', padding: '5px', marginRight: '5px' }}
      >
        Test Toast Here
      </button>
      <button 
        onClick={() => {
          console.log('[TestToast] Dismissing all toasts...');
          dismiss();
        }}
        style={{ background: 'red', color: 'white', padding: '5px' }}
      >
        Dismiss All
      </button>
      <div style={{ marginTop: '10px' }}>
        {toasts.map(t => (
          <div key={t.id} style={{ background: t.open ? 'green' : 'red', color: 'white', margin: '5px', padding: '5px' }}>
            <div>ID: {t.id}</div>
            <div>Title: {t.title}</div>
            <div>Desc: {t.description}</div>
            <div>Open: {t.open ? 'YES' : 'NO'}</div>
            <button 
              onClick={() => dismiss(t.id)}
              style={{ background: 'black', color: 'white', padding: '2px', marginTop: '2px' }}
            >
              Dismiss this
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}