import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const DEPLOYMENT_TIMESTAMP = import.meta.env.VITE_DEPLOYMENT_TIMESTAMP || '1704063600000';

interface InfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configId?: string | null;
  sourceFileName?: string;
  sourceRowCount?: number;
}

const InfoDialog = ({ open, onOpenChange, configId, sourceFileName, sourceRowCount }: InfoDialogProps) => {
  if (!open) return null;

  const getVersionNumber = () => {
    const REFERENCE_TIMESTAMP = 1704063600; // Jan 1, 2025 00:00:00 UTC
    const secondsSinceReference = Math.floor(Number(DEPLOYMENT_TIMESTAMP) / 1000) - REFERENCE_TIMESTAMP;
    const versionNumber = secondsSinceReference - 31560000;

    if (versionNumber < 0) {
      return "unknown";
    }

    return versionNumber.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1.');
  };

  const formatDate = () => {
    const date = new Date(Number(DEPLOYMENT_TIMESTAMP));

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
      timeZone: 'Europe/Brussels',
      hour12: false,
    });
    return { dateStr: formattedDate, timeStr };
  };

  const { dateStr, timeStr } = formatDate();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader className="border-b pb-4">
          <AlertDialogTitle className="text-2xl font-bold">
            CSV for Winfakt imports
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="py-4">
          <AlertDialogDescription className="space-y-3">
            <div className="space-y-3">
              {sourceFileName && (
                <div className="flex items-center">
                  <span className="font-medium min-w-[120px]">Source file:</span>
                  <span>{sourceFileName}</span>
                </div>
              )}
              {sourceRowCount !== undefined && (
                <div className="flex items-center">
                  <span className="font-medium min-w-[120px]">Available rows:</span>
                  <span>{sourceRowCount.toLocaleString('de-DE')}</span>
                </div>
              )}
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
                <span className="min-w-[120px]">Deployed:</span>
                <span>{dateStr}{timeStr ? ` at ${timeStr}` : ''}</span>
              </div>
            </div>
          </AlertDialogDescription>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default InfoDialog;