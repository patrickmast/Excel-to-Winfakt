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
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [searchTerm, setSearchTerm] = useState('');

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
      setSearchTerm(''); // Reset search term after copying
    }).catch((err) => {
      console.error('Failed to copy text: ', err);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    });
  };

  const filteredColumns = sourceColumns.filter(col => 
    col.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Settings for {columnName}</DialogTitle>
          <DialogDescription>
            Enter JavaScript code to transform the value. Use 'value' for the current column's value,
            and select a column from the menu to insert it in your code.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="expression" className="flex-1 flex flex-col">
          <TabsList className="border-b border-border h-8 justify-start space-x-8 bg-transparent p-0">
            <TabsTrigger 
              value="expression" 
              className="relative h-8 rounded-none border-b-2 border-transparent bg-transparent px-0 pb-3 pt-2 font-semibold text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              Expression
            </TabsTrigger>
            <TabsTrigger 
              value="functions"
              className="relative h-8 rounded-none border-b-2 border-transparent bg-transparent px-0 pb-3 pt-2 font-semibold text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              Functions
            </TabsTrigger>
          </TabsList>
          <TabsContent value="expression" className="flex-1 mt-0">
            <div className="h-full flex flex-col">
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 font-mono resize-none"
                placeholder="Example: value.toUpperCase() + ' ' + row['other_column']"
              />
            </div>
          </TabsContent>
          <TabsContent value="functions" className="flex-1 mt-0 overflow-y-auto">
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-semibold mb-2">String Operations</h4>
                <ul className="space-y-2 text-sm">
                  <li><code>value.toUpperCase()</code> - Convert to uppercase</li>
                  <li><code>value.toLowerCase()</code> - Convert to lowercase</li>
                  <li><code>value.trim()</code> - Remove whitespace from both ends</li>
                  <li><code>value.substring(start, end)</code> - Extract part of string</li>
                  <li><code>value.replace(search, replace)</code> - Replace text</li>
                </ul>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-semibold mb-2">Number Operations</h4>
                <ul className="space-y-2 text-sm">
                  <li><code>parseFloat(value)</code> - Convert to decimal number</li>
                  <li><code>parseInt(value)</code> - Convert to integer</li>
                  <li><code>Number(value).toFixed(2)</code> - Format with 2 decimals</li>
                  <li><code>Math.round(value)</code> - Round to nearest integer</li>
                  <li><code>Math.abs(value)</code> - Get absolute value</li>
                </ul>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-semibold mb-2">Date Operations</h4>
                <ul className="space-y-2 text-sm">
                  <li><code>new Date(value).toLocaleDateString()</code> - Format as date</li>
                  <li><code>new Date(value).toISOString()</code> - Convert to ISO format</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <div className="flex justify-between space-x-2 mt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Insert Column
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="max-h-[300px] overflow-y-auto">
              <DropdownMenuLabel>Available Columns</DropdownMenuLabel>
              <Input
                placeholder="Search source columns"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mx-1 my-1 w-[calc(100%-8px)]"
              />
              <DropdownMenuSeparator />
              {filteredColumns.map((col) => (
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