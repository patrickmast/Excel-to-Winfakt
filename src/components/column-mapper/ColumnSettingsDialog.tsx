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
import { PlayIcon } from 'lucide-react';
import TestResultDisplay from './TestResultDisplay';

const helperFunctionsMarkdown = `String Operations
value.toUpperCase()        // Convert to uppercase
value.toLowerCase()        // Convert to lowercase
value.trim()              // Remove whitespace from both ends
value.substring(start, end) // Extract part of string
value.replace(search, replace) // Replace text

Number Operations
parseFloat(value)         // Convert to decimal number
parseInt(value)           // Convert to integer
Number(value).toFixed(2)  // Format with 2 decimals
Math.round(value)         // Round to nearest integer
Math.abs(value)          // Get absolute value

Date Operations
new Date(value).toLocaleDateString() // Format as date
new Date(value).toISOString()        // Convert to ISO format`;

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
  const [expressionCode, setExpressionCode] = useState(initialCode);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'expression' | 'result' | 'functions'>('expression');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const handleSave = () => {
    onSave(expressionCode);
    onClose();
  };

  const testExpression = () => {
    try {
      // Reset previous results
      setTestResult(null);
      setTestError(null);

      // Create a sample row object with dummy data for testing
      const row: Record<string, any> = {};
      sourceColumns.forEach(col => {
        if (col.toLowerCase().includes('date')) {
          row[col] = new Date().toISOString();
        } else if (col.toLowerCase().includes('price') || col.toLowerCase().includes('amount')) {
          row[col] = 100.50;
        } else if (col.toLowerCase().includes('quantity') || col.toLowerCase().includes('number')) {
          row[col] = 42;
        } else {
          row[col] = 'Sample Text';
        }
      });

      // Create value variable as it's used in expressions
      const value = row[columnName] || 'Sample Value';

      // Evaluate the expression
      // eslint-disable-next-line no-new-func
      const result = new Function('row', 'value', `return ${expressionCode}`)(row, value);
      
      setTestResult(String(result));
      setActiveTab('result');
    } catch (error) {
      setTestError(error instanceof Error ? error.message : "An error occurred while evaluating the expression");
      setActiveTab('result');
    }
  };

  const copyToClipboard = (columnName: string) => {
    const text = `row["${columnName}"]`;
    navigator.clipboard.writeText(text).then(() => {
      setSearchTerm('');
    }).catch((err) => {
      console.error('Failed to copy text: ', err);
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
          onValueChange={(value) => setActiveTab(value as 'expression' | 'result' | 'functions')}
        >
          <TabsList className="h-8 justify-start space-x-8 bg-transparent p-0 pl-1">
            <TabsTrigger 
              value="expression" 
              className="relative h-8 rounded-none bg-transparent px-0 pb-1 pt-0 font-semibold text-muted-foreground hover:text-foreground data-[state=active]:font-bold data-[state=active]:text-foreground"
            >
              Expression
            </TabsTrigger>
            <TabsTrigger 
              value="result"
              className="relative h-8 rounded-none bg-transparent px-0 pb-1 pt-0 font-semibold text-muted-foreground hover:text-foreground data-[state=active]:font-bold data-[state=active]:text-foreground"
            >
              Result
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
          <TabsContent value="result" className="flex-1 mt-0">
            <TestResultDisplay result={testResult} error={testError} />
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
          <div className="flex space-x-2">
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
            <Button 
              variant="outline" 
              onClick={testExpression}
              className="gap-2"
            >
              <PlayIcon className="h-4 w-4" />
              Test
            </Button>
          </div>
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