import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import {
  PM7Dialog,
  PM7DialogContent,
  PM7DialogHeader,
  PM7DialogTitle,
  PM7DialogDescription,
  PM7DialogFooter,
  PM7DialogOverlay,
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
      <PM7DialogOverlay className="fixed inset-0 z-50 bg-black/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <PM7DialogContent className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
        <PM7DialogHeader>
          <PM7DialogTitle>{t('unsavedChanges.title')}</PM7DialogTitle>
          <PM7DialogDescription>
            {t('unsavedChanges.description')}
          </PM7DialogDescription>
        </PM7DialogHeader>
        
        <PM7DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button 
            variant="outline"
            onClick={handleCancel}
          >
            {t('unsavedChanges.cancelButton')}
          </Button>
          <Button 
            onClick={handleDiscard} 
            variant="destructive"
          >
            {t('unsavedChanges.discardButton')}
          </Button>
          <Button 
            onClick={handleSave}
          >
            {t('unsavedChanges.saveButton')}
          </Button>
        </PM7DialogFooter>
      </PM7DialogContent>
    </PM7Dialog>
  );
};

export default UnsavedChangesDialog;