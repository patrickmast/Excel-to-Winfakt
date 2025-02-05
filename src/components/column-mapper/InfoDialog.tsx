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

const DEPLOYMENT_TIMESTAMP = import.meta.env.VITE_DEPLOYMENT_TIMESTAMP || '1704063600000';

interface InfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configId?: string | null;
  sourceFileName?: string;
  sourceRowCount?: number;
  worksheetName?: string;
}

const InfoDialog = ({ open, onOpenChange, configId, sourceFileName, sourceRowCount, worksheetName }: InfoDialogProps) => {
  const [lastModified, setLastModified] = useState<string>(DEPLOYMENT_TIMESTAMP);
  const [formattedDate, setFormattedDate] = useState<string>('');

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
          console.error('Failed to fetch last modified time:', error);
        }
      };

      fetchLastModified();
      const interval = setInterval(fetchLastModified, 5000);
      return () => clearInterval(interval);
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
              <span className="font-medium min-w-[140px] text-slate-600">Source file:</span>
              <span className="text-slate-700">{sourceFileName || 'None'}</span>
            </div>
            {worksheetName && (
              <div className="flex items-center">
                <span className="font-medium min-w-[140px] text-slate-600">Worksheet:</span>
                <span className="text-slate-700">{worksheetName}</span>
              </div>
            )}
            <div className="flex items-center">
              <span className="font-medium min-w-[140px] text-slate-600">Available rows:</span>
              <span className="text-slate-700">{(sourceRowCount || 0).toLocaleString('de-DE')}</span>
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
              <span className="min-w-[140px] text-slate-500">Version:</span>
              <span className="text-slate-600">{getVersionNumber()}</span>
            </div>
            <div className="flex items-center">
              <span className="min-w-[140px] text-slate-500">{import.meta.env.DEV ? 'Last modified:' : 'Deployed:'}</span>
              <span className="text-slate-600">{formattedDate}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="p-5 bg-gray-50">
          <Button 
            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white border-0 
                      shadow-none rounded-md px-6"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InfoDialog;