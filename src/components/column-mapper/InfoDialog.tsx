import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface InfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configId?: string | null;
}

const InfoDialog = ({ open, onOpenChange, configId }: InfoDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>About CSV Transformer</AlertDialogTitle>
          <AlertDialogDescription>
            Version 1.0.0
            {configId && (
              <div className="mt-2">
                Configuration ID: {configId}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default InfoDialog;