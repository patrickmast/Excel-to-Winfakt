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

  const handleSave = () => {
    onSave(code);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings for {columnName}</DialogTitle>
          <DialogDescription>
            Enter JavaScript code to transform the value. Use 'value' for the current column's value,
            and 'row["column_name"]' to access other columns.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Available columns:
            </p>
            <div className="text-sm space-y-1 mb-4">
              <code className="bg-slate-100 px-1 py-0.5 rounded">value</code>
              <span className="text-slate-500"> - current column value</span>
              {sourceColumns.map((col) => (
                <div key={col}>
                  <code className="bg-slate-100 px-1 py-0.5 rounded">row["{col}"]</code>
                  <span className="text-slate-500"> - value from {col}</span>
                </div>
              ))}
            </div>
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
  );
};

export default ColumnSettingsDialog;