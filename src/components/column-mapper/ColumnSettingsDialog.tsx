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

const helperFunctionsMarkdown = `# Available Helper Functions

## String Operations
value.toUpperCase()        // Convert to uppercase
value.toLowerCase()        // Convert to lowercase
value.trim()              // Remove whitespace from both ends
value.substring(start, end) // Extract part of string
value.replace(search, replace) // Replace text

## Number Operations
parseFloat(value)         // Convert to decimal number
parseInt(value)           // Convert to integer
Number(value).toFixed(2)  // Format with 2 decimals
Math.round(value)         // Round to nearest integer
Math.abs(value)          // Get absolute value

## Date Operations
new Date(value).toLocaleDateString() // Format as date
new Date(value).toISOString()        // Convert to ISO format`;

const ColumnSettingsDialog = ({
  isOpen,
  onClose,
  columnName,
  onSave,
  initialCode = '',
  sourceColumns = [],
}: ColumnSettingsDialogProps) => {
  const [expressionCode, setExpressionCode] = useState(initialCode);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'expression' | 'functions'>('expression');

  const handleSave = () => {
    onSave(expressionCode);
    onClose();
  };

  const copyToClipboard = (columnName: string) => {
    const text = `row["${columnName}"]`;
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Column reference copied",
        description: `You can now paste ${text} in your transformation code.`,
      });
      setSearchTerm('');
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
        <Tabs 
          defaultValue="expression" 
          className="flex-1 flex flex-col"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'expression' | 'functions')}
        >
          <TabsList className="border-b border-border h-8 justify-start space-x-8 bg-transparent p-0">
            <TabsTrigger 
              value="expression" 
              className="relative h-8 rounded-none bg-transparent px-0 pb-1 pt-0 font-semibold text-muted-foreground hover:text-foreground data-[state=active]:font-bold data-[state=active]:text-foreground"
            >
              Expression
            </TabsTrigger>
            <TabsTrigger 
              value="functions"
              className="relative h-8 rounded-none bg-transparent px-0 pb-1 pt-0 font-semibold text-muted-foreground hover:text-foreground data-[state=active]:font-bold data-[state=active]:text-foreground"
            >
              Functions
            </TabsTrigger>
          </TabsList>
          <TabsContent value="expression" className="flex-1 mt-0">
            <div className="h-full flex flex-col">
              <Textarea
                value={expressionCode}
                onChange={(e) => setExpressionCode(e.target.value)}
                className="flex-1 font-mono resize-none"
                placeholder="Example: value.toUpperCase() + ' ' + row['other_column']"
              />
            </div>
          </TabsContent>
          <TabsContent value="functions" className="flex-1 mt-0">
            <div className="h-full flex flex-col">
              <Textarea
                value={helperFunctionsMarkdown}
                className="flex-1 font-mono resize-none"
                readOnly
              />
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