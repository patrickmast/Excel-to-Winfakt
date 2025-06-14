// NewConfirmDialog.tsx - Dialog to confirm creating new configuration
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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="p-0 overflow-hidden border-0">
        <div className="bg-slate-700 p-5 rounded-t-lg">
          <AlertDialogTitle className="text-white m-0 text-base">{t('newConfig.confirmTitle')}</AlertDialogTitle>
        </div>
        
        <div className="py-8 px-6">
          <AlertDialogDescription className="text-slate-700 mb-6">
            {t('newConfig.confirmDescription')}
          </AlertDialogDescription>
          
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel className="bg-slate-100 hover:bg-slate-200 text-slate-700">{t('newConfig.cancelButton')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700">
              {t('newConfig.confirmButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NewConfirmDialog;