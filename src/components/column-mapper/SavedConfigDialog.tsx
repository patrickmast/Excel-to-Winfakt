import { Copy } from 'lucide-react';
import {
  PM7Dialog,
  PM7DialogContent,
  PM7DialogHeader,
  PM7DialogTitle,
  PM7DialogDescription,
  PM7Button
} from 'pm7-ui-style-guide';
import 'pm7-ui-style-guide/src/components/dialog/pm7-dialog.css';
import { showToast } from '@/components/ui/SimpleToast';

interface SavedConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configUrl: string;
}

const SavedConfigDialog = ({ open, onOpenChange, configUrl }: SavedConfigDialogProps) => {
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(configUrl);
      showToast({
        title: "URL copied",
        description: "Configuration URL has been copied to clipboard",
      });
    } catch (err) {
      showToast({
        title: "Failed to copy",
        description: "Please copy the URL manually",
        variant: "destructive",
      });
    }
  };

  return (
    <PM7Dialog open={open} onOpenChange={onOpenChange}>
      <PM7DialogContent maxWidth="sm" showCloseButton={true}>
        <PM7DialogHeader>
          <PM7DialogTitle>Settings saved successfully</PM7DialogTitle>
          <PM7DialogDescription>
            <div className="space-y-4">
              <p>Your configuration has been saved. You can access it using the URL below:</p>
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <span className="flex-1 text-sm break-all">{configUrl}</span>
                <PM7Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyUrl}
                  className="h-8 w-8"
                >
                  <Copy className="h-4 w-4" />
                </PM7Button>
              </div>
            </div>
          </PM7DialogDescription>
        </PM7DialogHeader>
      </PM7DialogContent>
    </PM7Dialog>
  );
};

export default SavedConfigDialog;