// Updated to add language switcher in the info dialog
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatRelativeDate } from '@/utils/dateFormat';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '@/i18n';

const DEPLOYMENT_TIMESTAMP = import.meta.env.VITE_DEPLOYMENT_TIMESTAMP || '1704063600000';

interface InfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configId?: string | null;
  sourceFileName?: string;
  sourceRowCount?: number;
  worksheetName?: string;
  // Added to support passing sourceFileInfo object directly
  sourceFileInfo?: {
    filename: string;
    rowCount: number;
    worksheetName?: string;
    size?: number;
  } | null;
}

const InfoDialog = ({ open, onOpenChange, configId, sourceFileName, sourceRowCount, worksheetName, sourceFileInfo }: InfoDialogProps) => {
  // Use sourceFileInfo if provided, otherwise use individual props
  const filename = sourceFileInfo?.filename || sourceFileName;
  const rowCount = sourceFileInfo?.rowCount || sourceRowCount || 0;
  const worksheet = sourceFileInfo?.worksheetName || worksheetName;
  const [lastModified, setLastModified] = useState<string>(DEPLOYMENT_TIMESTAMP);
  const [formattedDate, setFormattedDate] = useState<string>('');
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (import.meta.env.DEV && open) {
      const fetchLastModified = async () => {
        try {
          const response = await fetch('/api/last-modified');
          const data = await response.json();
          const date = new Date(Number(data.timestamp));
          const { dateStr, timeStr } = formatRelativeDate(date);
          setLastModified(data.timestamp.toString());
          setFormattedDate(`${dateStr} at ${timeStr}`);
        } catch (error) {
          // Improved error handling with more specific message
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('Failed to fetch last modified time:', { error: errorMessage });
        }
      };

      fetchLastModified();
      const interval = setInterval(fetchLastModified, 5000);
      return () => clearInterval(interval);
    } else {
      // Handle production case
      const date = new Date(Number(DEPLOYMENT_TIMESTAMP));
      const { dateStr, timeStr } = formatRelativeDate(date);
      setFormattedDate(`${dateStr} at ${timeStr}`);
    }
  }, [open]);

  if (!open) return null;

  const getVersionNumber = () => {
    const REFERENCE_TIMESTAMP = 1704063600; // Jan 1, 2025 00:00:00 UTC
    const secondsSinceReference = Math.floor(Number(lastModified) / 1000) - REFERENCE_TIMESTAMP;
    const versionNumber = secondsSinceReference - 31560000;

    if (versionNumber < 0) {
      return "unknown";
    }

    return versionNumber.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1.');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden border-0 min-w-[500px]">
        <div className="bg-slate-700 p-5 rounded-t-lg">
          <DialogTitle className="text-white m-0 text-base">CSV for Winfakt imports</DialogTitle>
        </div>

        <div className="py-8 px-6">
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="font-medium min-w-[140px] text-slate-600">{t('header.sourceFile')}:</span>
              <span className="text-slate-700">{filename || 'None'}</span>
            </div>
            {worksheet && (
              <div className="flex items-center">
                <span className="font-medium min-w-[140px] text-slate-600">Worksheet:</span>
                <span className="text-slate-700">{worksheet}</span>
              </div>
            )}
            <div className="flex items-center">
              <span className="font-medium min-w-[140px] text-slate-600">{t('columnMapper.availableRows')}:</span>
              <span className="text-slate-700">{rowCount.toLocaleString('de-DE')}</span>
            </div>
            {configId && (
              <div className="flex items-center">
                <span className="font-medium min-w-[140px] text-slate-600">Config ID:</span>
                <span className="text-slate-700">{configId}</span>
              </div>
            )}
          </div>

          <div className="text-xs mt-8 pt-4 border-t space-y-2">
            <div className="flex items-center">
              <span className="min-w-[140px] text-slate-500">{t('common.version')}:</span>
              <span className="text-slate-600">{getVersionNumber()}</span>
            </div>
            <div className="flex items-center">
              <span className="min-w-[140px] text-slate-500">{import.meta.env.DEV ? t('common.lastModified') : t('common.deployedOn')}:</span>
              <span className="text-slate-600">{formattedDate}</span>
            </div>

          </div>
        </div>

        <div className="p-5 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-slate-500 text-xs mr-2">Language:</span>
              <select 
                className="bg-white border border-gray-300 rounded-md px-2 py-1 text-xs"
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="nl">Nederlands</option>
                <option value="fr">Français</option>
                <option value="tr">Türkçe</option>
              </select>
            </div>
            <Button 
              className="bg-[#3b82f6] hover:bg-[#2563eb] text-white border-0 
                        shadow-none rounded-md px-6"
              onClick={() => onOpenChange(false)}
            >
              {t('dialogs.close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InfoDialog;