// NewConfirmDialog.tsx - Dialog to confirm creating new configuration
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  PM7Dialog,
  PM7DialogContent,
  PM7DialogHeader,
  PM7DialogTitle,
  PM7DialogDescription,
  PM7DialogFooter,
  PM7DialogOverlay,
  PM7Button,
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
      <PM7DialogContent>
        <PM7DialogHeader>
          <PM7DialogTitle>{t('newConfig.confirmTitle')}</PM7DialogTitle>
          <PM7DialogDescription>
            {t('newConfig.confirmDescription')}
          </PM7DialogDescription>
        </PM7DialogHeader>
        
        <PM7DialogFooter>
          <PM7Button 
            className="pm7-button-ghost" 
            onClick={() => onOpenChange(false)}
          >
            {t('newConfig.cancelButton')}
          </PM7Button>
          <PM7Button 
            onClick={handleConfirm}
          >
            {t('newConfig.confirmButton')}
          </PM7Button>
        </PM7DialogFooter>
      </PM7DialogContent>
    </PM7Dialog>
  );
};

export default NewConfirmDialog;