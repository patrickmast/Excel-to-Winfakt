import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayIcon } from 'lucide-react';
import ExpressionEditor from './ExpressionEditor';
import HelperFunctions from './HelperFunctions';
import ColumnSelector from './ColumnSelector';

interface ColumnSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  columnName: string;
  onSave: (code: string) => void;
  initialCode?: string;
  sourceColumns: string[];
}

const ColumnSettingsDialog: React.FC<ColumnSettingsDialogProps> = ({
  isOpen,
  onClose,
  columnName,
  onSave,
  initialCode = '',
  sourceColumns = [],
}) => {
  const [expressionCode, setExpressionCode] = useState(initialCode);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'expression' | 'result' | 'functions'>('expression');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const handleSave = () => {
    onSave(expressionCode);
    onClose();
  };

  const testExpression = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent tab change when clicking the icon
    try {
      setTestResult(null);
      setTestError(null);

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

      const value = row[columnName] || 'Sample Value';
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
            <TabsTrigger value="expression">Expression</TabsTrigger>
            <TabsTrigger value="result" className="flex items-center gap-2">
              Result <PlayIcon className="h-4 w-4 cursor-pointer hover:text-primary" onClick={testExpression} />
            </TabsTrigger>
            <TabsTrigger value="functions">Functions</TabsTrigger>
          </TabsList>
          <TabsContent value="expression" className="flex-1 mt-0">
            <ExpressionEditor 
              value={expressionCode}
              onChange={setExpressionCode}
              result={null}
              error={null}
            />
          </TabsContent>
          <TabsContent value="result" className="flex-1 mt-0">
            <ExpressionEditor 
              value={expressionCode}
              onChange={setExpressionCode}
              result={testResult}
              error={testError}
            />
          </TabsContent>
          <TabsContent value="functions" className="flex-1 mt-0">
            <HelperFunctions />
          </TabsContent>
        </Tabs>
        <div className="flex justify-between space-x-2 mt-2">
          <div className="flex space-x-2">
            <ColumnSelector
              sourceColumns={sourceColumns}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onColumnSelect={copyToClipboard}
            />
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