import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  PM7Dialog,
  PM7DialogContent,
  PM7DialogHeader,
  PM7DialogTitle,
  PM7DialogDescription,
  PM7DialogFooter,
  PM7Button,
} from 'pm7-ui-style-guide';

interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  onDiscard,
  onCancel,
}) => {
  const { t } = useTranslation();

  const handleSave = () => {
    onSave();
    onOpenChange(false);
  };

  const handleDiscard = () => {
    onDiscard();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <PM7Dialog open={open} onOpenChange={onOpenChange}>
      <PM7DialogContent>
        <PM7DialogHeader>
          <PM7DialogTitle>{t('unsavedChanges.title')}</PM7DialogTitle>
          <PM7DialogDescription>
            {t('unsavedChanges.description')}
          </PM7DialogDescription>
        </PM7DialogHeader>
        
        <PM7DialogFooter className="flex flex-row justify-end space-x-2 bg-gray-50 px-6 py-4 border-t">
          <PM7Button 
            className="pm7-button-ghost mr-auto"
            onClick={handleCancel}
          >
            {t('unsavedChanges.cancelButton')}
          </PM7Button>
          <PM7Button 
            onClick={handleDiscard} 
            className="pm7-button-destructive"
          >
            {t('unsavedChanges.discardButton')}
          </PM7Button>
          <PM7Button 
            onClick={handleSave}
          >
            {t('unsavedChanges.saveButton')}
          </PM7Button>
        </PM7DialogFooter>
      </PM7DialogContent>
    </PM7Dialog>
  );
};

export default UnsavedChangesDialog;