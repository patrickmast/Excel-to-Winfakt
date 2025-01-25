import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription
} from '@/components/ui/dialog';
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
      <DialogContent>
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-bold">
            CSV for Winfakt imports
          </DialogTitle>
          <DialogDescription className="sr-only">
            Information about the current CSV file and application configuration
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="font-medium min-w-[120px]">Source file:</span>
              <span>{sourceFileName || 'None'}</span>
            </div>
            {worksheetName && (
              <div className="flex items-center">
                <span className="font-medium min-w-[120px]">Worksheet:</span>
                <span>{worksheetName}</span>
              </div>
            )}
            <div className="flex items-center">
              <span className="font-medium min-w-[120px]">Available rows:</span>
              <span>{(sourceRowCount || 0).toLocaleString('de-DE')}</span>
            </div>
            {configId && (
              <div className="flex items-center">
                <span className="font-medium min-w-[120px]">Config ID:</span>
                <span>{configId}</span>
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground mt-6 pt-4 border-t space-y-1">
            <div className="flex items-center">
              <span className="min-w-[120px]">Version:</span>
              <span>{getVersionNumber()}</span>
            </div>
            <div className="flex items-center">
              <span className="min-w-[120px]">{import.meta.env.DEV ? 'Last modified:' : 'Deployed:'}</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose onClick={() => onOpenChange(false)}>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InfoDialog;