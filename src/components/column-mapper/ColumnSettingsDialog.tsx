import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { HelpCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"

interface ColumnSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  columnName: string;
  onSave: (code: string) => void;
  initialCode?: string;
  sourceColumns: string[];
}

const ColumnSettingsDialog = ({
  isOpen,
  onClose,
  columnName,
  onSave,
  initialCode = '',
  sourceColumns = [],
}: ColumnSettingsDialogProps) => {
  const [code, setCode] = useState(initialCode);
  const [showHelp, setShowHelp] = useState(false);

  const handleSave = () => {
    onSave(code);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Settings for {columnName}</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHelp(true)}
                className="h-8 w-8"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            </div>
            <DialogDescription>
              Enter JavaScript code to transform the value. Use 'value' for the current column's value,
              and 'row["column_name"]' to access other columns.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono"
                placeholder="Example: value.toUpperCase() + ' ' + row['other_column']"
                rows={5}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showHelp} onOpenChange={setShowHelp}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Available Columns</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <p>You can use these variables in your transformation code:</p>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <code className="bg-slate-100 px-1 py-0.5 rounded">value</code>
                    <span className="text-slate-500">current column value</span>
                  </div>
                  {sourceColumns.map((col) => (
                    <div key={col} className="flex items-start space-x-2">
                      <code className="bg-slate-100 px-1 py-0.5 rounded whitespace-nowrap">
                        row["{col}"]
                      </code>
                      <span className="text-slate-500">value from {col}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Example: <code className="bg-slate-100 px-1 py-0.5 rounded">value.toUpperCase() + ' ' + row['other_column']</code>
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ColumnSettingsDialog;