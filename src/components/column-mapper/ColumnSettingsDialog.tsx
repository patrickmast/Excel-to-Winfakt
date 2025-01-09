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
  sourceData: any[];
}

const ColumnSettingsDialog: React.FC<ColumnSettingsDialogProps> = ({
  isOpen,
  onClose,
  columnName,
  onSave,
  initialCode = '',
  sourceColumns = [],
  sourceData = [],
}) => {
  const [expressionCode, setExpressionCode] = useState(initialCode);
  const [activeTab, setActiveTab] = useState<'expression' | 'result' | 'functions' | 'Source columns'>('expression');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const handleSave = () => {
    onSave(expressionCode);
    onClose();
  };

  const testExpression = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setTestResult(null);
      setTestError(null);

      const row = sourceData.length > 0 ? sourceData[0] : {};
      const value = row[columnName];
      
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
    navigator.clipboard.writeText(text).catch((err) => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[625px] h-[90vh] max-h-[700px] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Settings for {columnName}</DialogTitle>
          <DialogDescription>
            Enter JavaScript code to transform the value. Use 'value' for the current column's value,
            and select a column from the menu to insert it in your code.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Tabs 
            defaultValue="expression" 
            className="flex-1 flex flex-col"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'expression' | 'result' | 'functions' | 'Source columns')}
          >
            <TabsList className="h-10 px-6 justify-start space-x-8 bg-transparent">
              <TabsTrigger value="expression">Expression</TabsTrigger>
              <TabsTrigger value="result" className="flex items-center gap-2">
                Result <PlayIcon className="h-4 w-4 cursor-pointer hover:text-primary" onClick={testExpression} />
              </TabsTrigger>
              <TabsTrigger value="functions">Functions</TabsTrigger>
              <TabsTrigger value="Source columns">Source columns</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-hidden">
              <TabsContent value="expression" className="h-full m-0 data-[state=active]:flex">
                <ExpressionEditor 
                  value={expressionCode}
                  onChange={setExpressionCode}
                  result={null}
                  error={null}
                />
              </TabsContent>
              <TabsContent value="result" className="h-full m-0 data-[state=active]:flex">
                <ExpressionEditor 
                  value={expressionCode}
                  onChange={setExpressionCode}
                  result={testResult}
                  error={testError}
                />
              </TabsContent>
              <TabsContent value="functions" className="h-full m-0 data-[state=active]:flex">
                <HelperFunctions />
              </TabsContent>
              <TabsContent value="Source columns" className="h-full m-0 data-[state=active]:flex">
                <ColumnSelector
                  sourceColumns={sourceColumns}
                  sourceData={sourceData}
                  onColumnSelect={copyToClipboard}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="flex justify-end space-x-2 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnSettingsDialog;