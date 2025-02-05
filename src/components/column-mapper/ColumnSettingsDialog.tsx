import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription
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
  const [referenceStyle, setReferenceStyle] = useState<'name' | 'letter' | 'number'>('name');

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

  // Convert number to Excel column letter (1 -> A, 2 -> B, etc.)
  const getExcelColumnLetter = (columnNumber: number): string => {
    let dividend = columnNumber;
    let columnName = '';
    let modulo;

    while (dividend > 0) {
      modulo = (dividend - 1) % 26;
      columnName = String.fromCharCode(65 + modulo) + columnName;
      dividend = Math.floor((dividend - modulo) / 26);
    }

    return columnName;
  };

  const generateColumnReference = (
    columnName: string,
    index: number,
    style: 'name' | 'letter' | 'number'
  ): string => {
    if (style === 'name') {
      if (!columnName) {
        console.warn('Attempted to copy empty column name');
        return '';
      }

      // First normalize all types of whitespace to spaces
      const sanitizedColumnName = columnName.replace(/\s+/g, ' ').trim();
      
      // Safety check: if after sanitization we have an empty string, 
      // use the original column name to avoid creating invalid expressions
      const finalColumnName = sanitizedColumnName || columnName;

      // Escape any existing quotes in the column name
      const escapedColumnName = finalColumnName.replace(/"/g, '\\"');
      
      return `col["${escapedColumnName}"]`;
    } else if (style === 'letter') {
      return `col[${getExcelColumnLetter(index + 1)}]`;
    } else {
      return `col[${index + 1}]`;
    }
  };

  const copyToClipboard = (columnName: string, index: number, style: 'name' | 'letter' | 'number' = 'name') => {
    const text = generateColumnReference(columnName, index, style);
    if (!text) return;
    
    navigator.clipboard.writeText(text).catch((err) => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="p-0 overflow-hidden border-0 max-w-[625px] h-[90vh] max-h-[700px] flex flex-col">
        <div className="bg-slate-700 p-5 rounded-t-lg flex-shrink-0">
          <DialogTitle className="text-white m-0 text-base">Settings for {columnName}</DialogTitle>
          <DialogDescription className="text-slate-300 mt-1">
            Enter JavaScript code to transform the value. Use 'value' for the current column's value,
            and select a column from the menu to insert it in your code.
          </DialogDescription>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <Tabs
            defaultValue="expression"
            className="flex-1 flex flex-col min-h-0"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'expression' | 'result' | 'functions' | 'Source columns')}
          >
            <TabsList className="h-10 px-6 justify-start space-x-8 bg-transparent flex-shrink-0 border-b">
              <TabsTrigger value="expression">Expression</TabsTrigger>
              <TabsTrigger value="result" className="flex items-center gap-2">
                Result <PlayIcon
                  className={`h-4 w-4 cursor-pointer hover:text-primary ${activeTab === 'result' ? 'text-[#048F01]' : ''}`}
                  onClick={testExpression}
                />
              </TabsTrigger>
              <TabsTrigger value="functions">Functions</TabsTrigger>
              <TabsTrigger value="Source columns">Source columns</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="expression" className="h-full m-0 data-[state=active]:flex">
                <ExpressionEditor
                  code={expressionCode}
                  onChange={setExpressionCode}
                />
              </TabsContent>

              <TabsContent value="result" className="h-full m-0">
                <div className="p-4">
                  {testError ? (
                    <div className="text-red-500">{testError}</div>
                  ) : testResult !== null ? (
                    <div>
                      <pre className="bg-slate-100 p-2 rounded">
                        <code>
                          {testResult}
                        </code>
                      </pre>
                    </div>
                  ) : (
                    <div className="text-slate-500">
                      Click the play button to test your expression
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="functions" className="h-full m-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
                <HelperFunctions />
              </TabsContent>

              <TabsContent value="Source columns" className="h-full m-0">
                <div className="space-y-2">
                  <div className="p-2 pl-4 bg-muted text-sm text-muted-foreground">
                    Click a column to copy its reference. You can use column names (col["Name"]), letters (col[A]), or numbers (col[1]).
                  </div>
                  <ColumnSelector
                    columns={sourceColumns}
                    onColumnClick={(columnName, index) => {
                      const nextStyle = referenceStyle === 'name' 
                        ? 'letter' 
                        : referenceStyle === 'letter' 
                          ? 'number' 
                          : 'name';
                      setReferenceStyle(nextStyle);
                      copyToClipboard(columnName, index, nextStyle);
                    }}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="p-5 bg-gray-50 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-200"
          >
            Cancel
          </Button>
          <Button 
            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white border-0 
                      shadow-none rounded-md px-6"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnSettingsDialog;