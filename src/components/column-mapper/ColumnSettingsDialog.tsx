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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

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

  const copyToClipboard = (columnName: string) => {
    const text = `row["${columnName}"]`;
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Column reference copied",
        description: `You can now paste ${text} in your transformation code.`,
      });
    }).catch((err) => {
      console.error('Failed to copy text: ', err);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings for {columnName}</DialogTitle>
          <DialogDescription>
            Enter JavaScript code to transform the value. Use 'value' for the current column's value,
            and select a column from the menu to insert it in your code.
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
        <div className="flex justify-between space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Insert Column
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Available Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sourceColumns.map((col) => (
                <DropdownMenuItem
                  key={col}
                  onClick={() => copyToClipboard(col)}
                >
                  {col}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnSettingsDialog;