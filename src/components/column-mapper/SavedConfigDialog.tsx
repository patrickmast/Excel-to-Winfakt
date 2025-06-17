import { Button } from '../ui/button';
import { Copy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings saved successfully</DialogTitle>
          <DialogDescription className="space-y-4">
            <p>Your configuration has been saved. You can access it using the URL below:</p>
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <span className="flex-1 text-sm break-all">{configUrl}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyUrl}
                className="h-8 w-8"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default SavedConfigDialog;