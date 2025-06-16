// NewConfirmDialog.tsx - Dialog to confirm creating new configuration
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import {
  PM7Dialog,
  PM7DialogContent,
  PM7DialogHeader,
  PM7DialogTitle,
  PM7DialogDescription,
  PM7DialogFooter,
  PM7DialogOverlay,
} from 'pm7-ui-style-guide';

interface NewConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const NewConfirmDialog: React.FC<NewConfirmDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
}) => {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <PM7Dialog open={open} onOpenChange={onOpenChange}>
      <PM7DialogOverlay className="fixed inset-0 z-50 bg-black/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <PM7DialogContent className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
        <PM7DialogHeader>
          <PM7DialogTitle>{t('newConfig.confirmTitle')}</PM7DialogTitle>
          <PM7DialogDescription>
            {t('newConfig.confirmDescription')}
          </PM7DialogDescription>
        </PM7DialogHeader>
        
        <PM7DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            {t('newConfig.cancelButton')}
          </Button>
          <Button 
            onClick={handleConfirm}
            style={{ backgroundColor: '#1B86EF', color: 'white' }}
          >
            {t('newConfig.confirmButton')}
          </Button>
        </PM7DialogFooter>
      </PM7DialogContent>
    </PM7Dialog>
  );
};

export default NewConfirmDialog;