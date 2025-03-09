// ClearSettingsConfirmDialog.tsx - Dialog to confirm clearing settings
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

interface ClearSettingsConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const ClearSettingsConfirmDialog: React.FC<ClearSettingsConfirmDialogProps> = ({
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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="p-0 overflow-hidden border-0">
        <div className="bg-slate-700 p-5 rounded-t-lg">
          <AlertDialogTitle className="text-white m-0 text-base">{t('clearSettings.confirmTitle')}</AlertDialogTitle>
        </div>
        
        <div className="py-8 px-6">
          <AlertDialogDescription className="text-slate-700 mb-6">
            {t('clearSettings.confirmDescription')}
          </AlertDialogDescription>
          
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel className="bg-slate-100 hover:bg-slate-200 text-slate-700">{t('clearSettings.cancelButton')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className="bg-red-600 hover:bg-red-700">
              {t('clearSettings.confirmButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ClearSettingsConfirmDialog;
