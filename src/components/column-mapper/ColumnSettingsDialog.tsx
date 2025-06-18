import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PM7Dialog,
  PM7DialogContent,
  PM7DialogHeader,
  PM7DialogTitle,
  PM7DialogDescription,
  PM7DialogFooter,
  PM7Button
} from 'pm7-ui-style-guide';
import 'pm7-ui-style-guide/src/components/dialog/pm7-dialog.css';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpCircle } from 'lucide-react';
import ExpressionEditor from './ExpressionEditor';
import HelperFunctions from './HelperFunctions';
import ColumnSelector from './ColumnSelector';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createColumnProxy, createExpressionWrapper } from '@/utils/expressionUtils';

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
  const { t } = useTranslation();
  const [expressionCode, setExpressionCode] = useState(initialCode);
  const [activeTab, setActiveTab] = useState<'expression' | 'result' | 'functions' | 'Source columns'>('expression');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [referenceStyle, setReferenceStyle] = useState<'name' | 'letter' | 'number'>('name');
  const [lastEvaluatedExpression, setLastEvaluatedExpression] = useState<string>('');

  const handleSave = () => {
    onSave(expressionCode);
    onClose();
  };

  // Automatically evaluate when switching to result tab
  useEffect(() => {
    if (activeTab === 'result' && expressionCode !== lastEvaluatedExpression) {
      evaluateExpression();
    }
  }, [activeTab, expressionCode, lastEvaluatedExpression]);

  const evaluateExpression = () => {
    if (!expressionCode.trim()) {
      setTestResult(null);
      setTestError(t('columnMapper.enterExpression'));
      setLastEvaluatedExpression(expressionCode);
      return;
    }

    try {
      setTestResult(null);
      setTestError(null);

      // Create test data if no sourceData is available
      let rowData;
      if (sourceData.length > 0) {
        rowData = sourceData[0];
      } else {
        // Create mock data for testing when no file is loaded
        rowData = {};
        sourceColumns.forEach((col, index) => {
          // Create more realistic test data
          if (col.toLowerCase().includes('prijs') || col.toLowerCase().includes('price')) {
            rowData[col] = `${(index + 1) * 10}.99`;
          } else if (col.toLowerCase().includes('aantal') || col.toLowerCase().includes('qty')) {
            rowData[col] = `${index + 1}`;
          } else {
            rowData[col] = `Voorbeeld ${index + 1}`;
          }
        });
      }
      
      const value = rowData[columnName];

      // Create a proxy object that supports different access patterns
      const col = createColumnProxy(rowData, sourceColumns);
      
      // Create wrapper function with expression preprocessing
      const wrapper = createExpressionWrapper(expressionCode, sourceColumns);
      
      const result = wrapper(col, value);
      setTestResult(String(result));
      setLastEvaluatedExpression(expressionCode);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred while evaluating the expression";
      setTestError(errorMessage);
      setLastEvaluatedExpression(expressionCode);
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
    <PM7Dialog open={isOpen} onOpenChange={() => onClose()}>
      <PM7DialogContent maxWidth="md" showCloseButton={false} className="max-w-[625px] h-[90vh] max-h-[700px] flex flex-col">
        <PM7DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <PM7DialogTitle>{t('columnMapper.settingsFor')} {columnName}</PM7DialogTitle>
              <PM7DialogDescription>
                {t('columnMapper.settingsDescription')}
              </PM7DialogDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <PM7Button
                  size="sm"
                  variant="ghost"
                  className="ml-2"
                >
                  <HelpCircle className="h-5 w-5" />
                </PM7Button>
              </PopoverTrigger>
              <PopoverContent className="w-[500px] p-4 shadow-2xl border-2" align="end">
                <h4 className="font-semibold mb-2">{t('columnMapper.helpTitle')}</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium mb-1">{t('columnMapper.helpVariables')}</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><code className="bg-slate-100 px-1 rounded">value</code> - {t('columnMapper.helpValueDesc')}</li>
                      <li><code className="bg-slate-100 px-1 rounded">col</code> - {t('columnMapper.helpColDesc')}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">{t('columnMapper.helpReferences')}</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><code className="bg-slate-100 px-1 rounded">col["Naam"]</code> - {t('columnMapper.helpByNameExact')}</li>
                      <li><code className="bg-slate-100 px-1 rounded">col[1]</code> - {t('columnMapper.helpByNumber')}</li>
                      <li><code className="bg-slate-100 px-1 rounded">col[B]</code> of <code className="bg-slate-100 px-1 rounded">col[b]</code> - {t('columnMapper.helpByLetterVariable')}</li>
                      <li><code className="bg-slate-100 px-1 rounded">col["B"]</code> - {t('columnMapper.helpByLetterString')}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">{t('columnMapper.helpExamples')}</p>
                    <ul className="list-none space-y-1 text-muted-foreground">
                      <li><code className="bg-slate-100 px-1 rounded block">value.toUpperCase()</code></li>
                      <li><code className="bg-slate-100 px-1 rounded block">col["Prijs"] * 1.21</code></li>
                      <li><code className="bg-slate-100 px-1 rounded block">col[0] + " - " + col[1]</code></li>
                      <li><code className="bg-slate-100 px-1 rounded block">col[a].substring(0, 5)</code></li>
                    </ul>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </PM7DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <Tabs
            defaultValue="expression"
            className="flex-1 flex flex-col min-h-0"
            value={activeTab}
            onValueChange={(value) => {
              const newTab = value as 'expression' | 'result' | 'functions' | 'Source columns';
              setActiveTab(newTab);
            }}
          >
            <TabsList className="h-10 px-6 justify-start space-x-8 bg-transparent flex-shrink-0 border-b">
              <TabsTrigger value="expression">{t('columnMapper.expression')}</TabsTrigger>
              <TabsTrigger value="result">
                {t('columnMapper.result')}
              </TabsTrigger>
              <TabsTrigger value="functions">{t('columnMapper.functions')}</TabsTrigger>
              <TabsTrigger value="Source columns">{t('columnMapper.sourceColumnsTab')}</TabsTrigger>
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
                      {t('columnMapper.enterExpression')}
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
                    {t('columnMapper.columnReferenceHelp')}
                  </div>
                  <ColumnSelector
                    columns={sourceColumns}
                    onColumnClick={(columnName) => {
                      const index = sourceColumns.indexOf(columnName);
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

        <PM7DialogFooter>
          <PM7Button
            variant="outline"
            onClick={onClose}
          >
            {t('columnMapper.cancel')}
          </PM7Button>
          <PM7Button 
            variant="primary"
            onClick={handleSave}
          >
            {t('columnMapper.save')}
          </PM7Button>
        </PM7DialogFooter>
      </PM7DialogContent>
    </PM7Dialog>
  );
};

export default ColumnSettingsDialog;