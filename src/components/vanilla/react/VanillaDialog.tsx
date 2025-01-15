import React, { useEffect, useRef } from 'react';
import { Dialog } from '../Dialog';
import '@/components/vanilla/Dialog.css';

interface VanillaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children?: React.ReactNode;
}

export const VanillaDialog = React.forwardRef<HTMLDivElement, VanillaDialogProps>(
  ({ open, onOpenChange, title, children }, ref) => {
    const dialogRef = useRef<Dialog | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!dialogRef.current) {
        dialogRef.current = new Dialog({
          title,
          onClose: () => onOpenChange(false),
        });
      }

      return () => {
        if (dialogRef.current) {
          dialogRef.current.destroy();
          dialogRef.current = null;
        }
      };
    }, [title, onOpenChange]);

    useEffect(() => {
      if (!dialogRef.current) return;

      if (open) {
        if (contentRef.current) {
          dialogRef.current.setContent(contentRef.current);
        }
        dialogRef.current.open();
      } else {
        dialogRef.current.close();
      }
    }, [open]);

    return (
      <div ref={contentRef} style={{ display: 'none' }}>
        {children}
      </div>
    );
  }
);
