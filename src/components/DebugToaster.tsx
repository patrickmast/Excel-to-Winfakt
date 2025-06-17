import React from 'react';
import * as ToastPrimitives from "@radix-ui/react-toast";
import { useToast } from 'pm7-ui-style-guide';

export function DebugToaster() {
  const { toasts } = useToast();
  
  console.log('[DebugToaster] Rendering with toasts:', toasts);
  
  return (
    <ToastPrimitives.Provider swipeDirection="right">
      {toasts.map(({ id, title, description, action, ...props }) => {
        console.log('[DebugToaster] Rendering toast:', id, props);
        return (
          <ToastPrimitives.Root
            key={id}
            {...props}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              background: 'white',
              border: '2px solid red',
              padding: '20px',
              zIndex: 99999,
              minWidth: '300px'
            }}
          >
            <ToastPrimitives.Title style={{ fontWeight: 'bold' }}>
              {title}
            </ToastPrimitives.Title>
            <ToastPrimitives.Description>
              {description}
            </ToastPrimitives.Description>
            <ToastPrimitives.Close style={{ position: 'absolute', top: '5px', right: '5px' }}>
              X
            </ToastPrimitives.Close>
          </ToastPrimitives.Root>
        );
      })}
      <ToastPrimitives.Viewport 
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          margin: '20px',
          width: '390px',
          maxWidth: '100vw',
          zIndex: 99999,
          outline: 'none'
        }}
      />
    </ToastPrimitives.Provider>
  );
}