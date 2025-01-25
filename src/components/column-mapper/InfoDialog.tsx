import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
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

  useEffect(() => {
    if (import.meta.env.DEV && open) {
      const fetchLastModified = async () => {
        try {
          const response = await fetch('/api/last-modified');
          const data = await response.json();
          setLastModified(data.timestamp.toString());
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

  const formatDate = () => {
    const date = new Date(Number(lastModified));

    if (date.getTime() === 1704063600000) {
      return { dateStr: "Deployment date unknown", timeStr: "" };
    }

    const formattedDate = date.toLocaleString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Europe/Brussels',
    });
    const timeStr = date.toLocaleString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Europe/Brussels',
      hour12: false,
    });
    
    if (import.meta.env.DEV) {
      return { 
        dateStr: formattedDate,
        timeStr
      };
    }
    return { 
      dateStr: `Deployed on ${formattedDate}`,
      timeStr
    };
  };

  const { dateStr, timeStr } = formatDate();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader className="border-b pb-4">
          <AlertDialogTitle className="text-2xl font-bold">
            CSV for Winfakt imports
          </AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            Information about the current CSV file and application configuration
          </AlertDialogDescription>
        </AlertDialogHeader>

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
              <span>{dateStr}{timeStr ? ` at ${timeStr}` : ''}</span>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default InfoDialog;