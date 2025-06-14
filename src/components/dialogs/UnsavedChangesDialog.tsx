import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="p-0 overflow-hidden border-0">
        <div className="bg-amber-600 p-5 rounded-t-lg">
          <AlertDialogTitle className="text-white m-0 text-base">{t('unsavedChanges.title')}</AlertDialogTitle>
        </div>
        
        <div className="py-8 px-6">
          <AlertDialogDescription className="text-slate-700 mb-6">
            {t('unsavedChanges.description')}
          </AlertDialogDescription>
          
          <AlertDialogFooter className="mt-6 gap-2 sm:justify-between">
            <AlertDialogCancel onClick={handleCancel}>
              {t('unsavedChanges.cancelButton')}
            </AlertDialogCancel>
            <div className="flex gap-2">
              <Button 
                onClick={handleDiscard} 
                variant="destructive"
              >
                {t('unsavedChanges.discardButton')}
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t('unsavedChanges.saveButton')}
              </Button>
            </div>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UnsavedChangesDialog;