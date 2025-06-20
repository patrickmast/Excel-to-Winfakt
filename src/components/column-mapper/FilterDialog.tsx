// Updated to use PM7Dialog components
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PM7Dialog,
  PM7DialogContent,
  PM7DialogHeader,
  PM7DialogTitle,
  PM7DialogFooter,
  PM7DialogDescription,
  PM7DialogSeparator,
  PM7Button
} from 'pm7-ui-style-guide';
import 'pm7-ui-style-guide/src/components/dialog/pm7-dialog.css';
import { Input } from "@/components/ui/input";
import { Plus, X, Code, Play, HelpCircle, Trash2 } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sourceColumns: string[];
  onApplyFilter: (filter: CompoundFilter | null) => void;
  sourceData?: any[];
  initialFilter?: CompoundFilter | null;
}

export interface SingleCondition {
  column: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty';
  value: string;
}

export interface FilterGroup {
  conditions: SingleCondition[];
  type: 'AND' | 'OR';
}

export interface CompoundFilter {
  groups: FilterGroup[];
  advancedMode?: boolean;
  expression?: string;
}

const getOperators = (t: (key: string) => string) => [
  { value: 'equals', label: t('columnMapper.filter.operators.equals') },
  { value: 'contains', label: t('columnMapper.filter.operators.contains') },
  { value: 'startsWith', label: t('columnMapper.filter.operators.startsWith') },
  { value: 'endsWith', label: t('columnMapper.filter.operators.endsWith') },
  { value: 'greaterThan', label: t('columnMapper.filter.operators.greaterThan') },
  { value: 'lessThan', label: t('columnMapper.filter.operators.lessThan') },
  { value: 'isEmpty', label: t('columnMapper.filter.operators.isEmpty') },
  { value: 'isNotEmpty', label: t('columnMapper.filter.operators.isNotEmpty') },
];

interface FilterConditionProps {
  condition: SingleCondition;
  onChange: (condition: SingleCondition) => void;
  onRemove: () => void;
  sourceColumns: string[];
  showRemove: boolean;
}

const FilterCondition = ({ condition, onChange, onRemove, sourceColumns, showRemove }: FilterConditionProps) => {
  const { t } = useTranslation();
  const operators = getOperators(t);
  const showValueInput = !['isEmpty', 'isNotEmpty'].includes(condition.operator);

  return (
    <div className="flex gap-2 items-start">
      <div className="flex-1 grid gap-2">
        <select
          value={condition.column}
          onChange={(e) => onChange({ ...condition, column: e.target.value })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          {sourceColumns.map((column, index) => (
            <option key={`${column}-${index}`} value={column}>{column}</option>
          ))}
        </select>
        <select
          value={condition.operator}
          onChange={(e) => {
            const newOperator = e.target.value as SingleCondition['operator'];
            onChange({
              ...condition,
              operator: newOperator,
              value: ['isEmpty', 'isNotEmpty'].includes(newOperator) ? '' : condition.value
            });
          }}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          {operators.map((op) => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>
        {showValueInput && (
          <Input
            value={condition.value}
            onChange={(e) => onChange({ ...condition, value: e.target.value })}
            placeholder="Enter value"
          />
        )}
      </div>
      {showRemove && (
        <PM7Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-10 w-10 shrink-0"
        >
          <X className="h-4 w-4" />
        </PM7Button>
      )}
    </div>
  );
};

const ExamplesTab = () => {
  return (
    <div className="w-full px-4">
      <div className="min-h-[200px] overflow-y-auto">
        <div className="space-y-3">
          <div>
            <div className="font-medium text-muted-foreground mb-1">Numbers:</div>
            <code className="text-xs block bg-muted p-2 rounded">{'col["NR"] > 100'}</code>
          </div>
          <div>
            <div className="font-medium text-muted-foreground mb-1">Dates:</div>
            <code className="text-xs block bg-muted p-2 rounded">{'col["Date"] > new Date("2024-01-01")'}</code>
          </div>
          <div>
            <div className="font-medium text-muted-foreground mb-1">Booleans:</div>
            <code className="text-xs block bg-muted p-2 rounded">{'col["Active"] === true'}</code>
          </div>
          <div>
            <div className="font-medium text-muted-foreground mb-1">Strings:</div>
            <code className="text-xs block bg-muted p-2 rounded">{'col["Name"].includes("John")'}</code>
          </div>
          <div className="mt-6 text-sm text-muted-foreground">
            <p className="mb-2">Additional examples:</p>
            <div className="space-y-3">
              <div>
                <div className="font-medium text-muted-foreground mb-1">Number range:</div>
                <code className="text-xs block bg-muted p-2 rounded">{'col["Amount"] >= 100 && col["Amount"] <= 1000'}</code>
              </div>
              <div>
                <div className="font-medium text-muted-foreground mb-1">Complex string condition:</div>
                <code className="text-xs block bg-muted p-2 rounded">{'col["Status"].toLowerCase().includes("pending") && col["Priority"] === "high"'}</code>
              </div>
              <div>
                <div className="font-medium text-muted-foreground mb-1">Empty check:</div>
                <code className="text-xs block bg-muted p-2 rounded">{'!col["Notes"] || col["Notes"].trim() === ""'}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FilterDialog = ({ isOpen, onClose, sourceColumns, onApplyFilter, sourceData = [], initialFilter }: FilterDialogProps) => {
  const { t } = useTranslation();
  const defaultCondition = {
    column: sourceColumns[0] || '',
    operator: 'equals',
    value: ''
  };
  const defaultGroup: FilterGroup = {
    conditions: [],
    type: 'AND'
  };

  const [groups, setGroups] = useState<FilterGroup[]>(() => {
    return initialFilter?.groups ?? [defaultGroup as FilterGroup];
  });

  const [isAdvancedMode, setIsAdvancedMode] = useState(initialFilter?.advancedMode ?? false);
  const [expression, setExpression] = useState(initialFilter?.expression ?? '');
  const [activeTab, setActiveTab] = useState<'expression' | 'examples'>('expression');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [hasBeenTested, setHasBeenTested] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const resetToDefault = () => {
    setGroups([defaultGroup]);
    setIsAdvancedMode(false);
    setExpression('');
    setShowClearConfirm(false);
  };

  const isFilterEmpty = useMemo(() => {
    if (isAdvancedMode) {
      return !expression.trim();
    }
    
    // Check if we have the default state
    if (groups.length !== 1) return false;
    const group = groups[0];
    
    return (
      group.type === 'AND' &&
      group.conditions.length === 0
    );
  }, [isAdvancedMode, expression, groups]);

  useEffect(() => {
    if (isOpen && initialFilter) {
      setGroups(initialFilter.groups);
      setIsAdvancedMode(initialFilter.advancedMode ?? false);
      setExpression(initialFilter.expression ?? '');
    }
  }, [isOpen, initialFilter]);

  const handleAddCondition = (groupIndex: number) => {
    const newGroups = [...groups];
    newGroups[groupIndex].conditions.push({
      column: sourceColumns[0] || '',
      operator: 'equals',
      value: ''
    });
    setGroups(newGroups);
  };

  const handleRemoveCondition = (groupIndex: number, conditionIndex: number) => {
    const newGroups = [...groups];
    newGroups[groupIndex].conditions.splice(conditionIndex, 1);
    if (newGroups[groupIndex].conditions.length === 0) {
      newGroups.splice(groupIndex, 1);
    }
    setGroups(newGroups);
  };

  const handleAddGroup = () => {
    setGroups([...groups, {
      conditions: [],
      type: 'AND' as 'AND' | 'OR'
    }]);
  };

  const handleUpdateCondition = (groupIndex: number, conditionIndex: number, condition: SingleCondition) => {
    const newGroups = [...groups];
    newGroups[groupIndex].conditions[conditionIndex] = condition;
    setGroups(newGroups);
  };

  const handleToggleGroupType = (groupIndex: number) => {
    const newGroups = [...groups];
    newGroups[groupIndex].type = newGroups[groupIndex].type === 'AND' ? 'OR' : 'AND';
    setGroups(newGroups);
  };

  const handleApply = () => {
    // Clear any previous test results/errors
    setTestResult(null);
    setTestError(null);

    if (isAdvancedMode) {
      if (!expression.trim()) {
        onApplyFilter(null);
        onClose();
        return;
      }

      try {
        // Test the expression with Function constructor
        const filterFn = new Function('_col', `
          const col = _col;
          const Col = _col;
          const COL = _col;
          return ${expression}
        `);

        // Test with first row if available
        if (sourceData.length > 0) {
          try {
            filterFn(sourceData[0]);
          } catch (error) {
            setTestError('Error: ' + (error as Error).message);
            return;
          }
        }

        onApplyFilter({
          groups: [],
          advancedMode: true,
          expression
        });
        onClose();
      } catch (error) {
        setTestError('Error: ' + (error as Error).message);
      }
    } else {
      if (groups.length === 0) {
        onApplyFilter(null);
        onClose();
        return;
      }

      onApplyFilter({
        groups,
        advancedMode: false
      });
      onClose();
    }
  };

  const isExpressionValid = (expr: string): boolean => {
    try {
      const filterFn = new Function('row', `return ${expr}`);
      if (sourceData.length > 0) {
        const result = filterFn(sourceData[0]);
        return typeof result === 'boolean';
      }
      return true; // If no sample data, just check syntax
    } catch (error) {
      return false;
    }
  };

  const handleTest = () => {
    try {
      setTestResult(null);
      setTestError(null);
      setHasBeenTested(true);

      // Test the expression with Function constructor
      const filterFn = new Function('row', `return ${expression}`);

      // For simple expressions like "true" or "false", test without data
      try {
        const result = filterFn({});
        if (typeof result !== 'boolean') {
          setTestError(t('columnMapper.filter.invalidJavaScript') + ": Expression must return a boolean value (true/false)");
          return;
        }

        // If there's no data or empty array, just show the result
        if (!sourceData || !Array.isArray(sourceData) || sourceData.length === 0) {
          setTestResult(`Test result: ${result}\n\nNote: No sample data available, tested with empty row object.`);
          setActiveTab('expression');
          return;
        }

        // If we have data, test with the first row
        const row = sourceData[0];
        const resultWithData = filterFn(row);
        setTestResult(`${t('columnMapper.filter.testResultWithFirstRow')}: ${resultWithData}`);
        setActiveTab('expression');
      } catch (error) {
        setTestError(`${t('columnMapper.filter.errorEvaluating')}: ${(error as Error).message}`);
      }
    } catch (error) {
      setTestError(`${t('columnMapper.filter.invalidJavaScript')}: ${(error as Error).message}`);
    }
  };

  // Reset hasBeenTested when expression changes
  const handleExpressionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExpression(e.target.value);
    setHasBeenTested(false);
    setTestResult(null);
    setTestError(null);
  };

  const isValid = isAdvancedMode
    ? expression.trim() !== '' && hasBeenTested && testResult !== null && testError === null
    : (groups.length > 0 && groups.every(group =>
        group.conditions.length > 0 && group.conditions.every(condition =>
          condition.column && (
            condition.operator === 'isEmpty' || condition.operator === 'isNotEmpty' ||
            (condition.value !== undefined && condition.value.trim() !== '')
          )
        )
      ));

  const getExampleExpression = () => {
    if (sourceColumns.length === 0) return '';
    const col1 = JSON.stringify(sourceColumns[0]);
    const col2 = sourceColumns.length > 1 ? JSON.stringify(sourceColumns[1]) : col1;
    return `// Example: Filter rows where ${sourceColumns[0]} is greater than 100 AND ${sourceColumns[1] || sourceColumns[0]} is empty\nrow[${col1}] > 100 && (!row[${col2}] || row[${col2}].trim() === '')`;
  };

  return (
    <PM7Dialog open={isOpen} onOpenChange={() => onClose()}>
      <PM7DialogContent maxWidth="md" showCloseButton={false} className="max-w-[600px]">
        <PM7DialogHeader>
          <PM7DialogTitle className="flex items-center justify-between">
            <span>{t('columnMapper.filter.title')}</span>
            <PM7Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAdvancedMode(!isAdvancedMode)}
              className="flex items-center gap-2"
            >
              <Code className="h-4 w-4" />
              {isAdvancedMode ? t('columnMapper.filter.switchToBasic') : t('columnMapper.filter.switchToAdvanced')}
            </PM7Button>
          </PM7DialogTitle>
          <PM7DialogDescription>
            {isAdvancedMode
              ? t('columnMapper.filter.advancedDescription')
              : t('columnMapper.filter.basicDescription')}
          </PM7DialogDescription>
        </PM7DialogHeader>
        {isAdvancedMode ? (
          <div className="flex-1 flex flex-col min-h-0 -mt-1">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as 'expression' | 'examples')}
              className="flex-1 flex flex-col min-h-0"
            >
              <TabsList className="h-10 px-6 justify-start space-x-8 bg-transparent flex-shrink-0">
                <TabsTrigger value="expression">{t('columnMapper.filter.filterExpression')}</TabsTrigger>
                <TabsTrigger value="examples">{t('columnMapper.filter.examples')}</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="expression" className="h-full m-0 data-[state=active]:flex">
                  <div className="w-full px-4">
                    <Textarea
                      value={expression}
                      onChange={handleExpressionChange}
                      placeholder={getExampleExpression()}
                      className="font-mono h-[200px] resize-none"
                    />
                    {testResult && (
                      <div className="text-sm bg-muted p-4 rounded mt-2">
                        <pre className="whitespace-pre-wrap">{testResult}</pre>
                      </div>
                    )}
                    {testError && (
                      <div className="text-sm text-destructive bg-destructive/10 p-4 rounded mt-2">
                        {testError}
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="examples" className="h-full m-0 data-[state=active]:flex">
                  <div className="w-full px-4">
                    <div className="h-[200px] overflow-y-auto bg-background rounded-md border border-input p-3">
                      <div className="space-y-3">
                        <div>
                          <div className="font-medium text-muted-foreground mb-1 flex items-center justify-between">
                            {t('columnMapper.filter.numbers')}:
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-[220px]">Compare numeric values directly. For text fields containing numbers, use Number() to convert them first.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <code className="text-xs block bg-muted p-2 rounded">{'col["NR"] > 100'}</code>
                          <code className="text-xs block bg-muted p-2 rounded mt-1">{'col["Price"] >= 10 && col["Price"] <= 20'}</code>
                          <code className="text-xs block bg-muted p-2 rounded mt-1">{'Number(col["Quantity"]) !== 0'}</code>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground mb-1 flex items-center justify-between">
                            {t('columnMapper.filter.dates')}:
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-[220px]">Convert strings to Date objects for date comparisons. You can also extract specific parts like year, month, or day.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <code className="text-xs block bg-muted p-2 rounded">{'col["Date"] > new Date("2024-01-01")'}</code>
                          <code className="text-xs block bg-muted p-2 rounded mt-1">{'new Date(col["StartDate"]) <= new Date(col["EndDate"])'}</code>
                          <code className="text-xs block bg-muted p-2 rounded mt-1">{'new Date(col["Date"]).getFullYear() === 2024'}</code>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground mb-1 flex items-center justify-between">
                            {t('columnMapper.filter.booleans')}:
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-[220px]">Handle boolean values and string representations of booleans. Use === true for explicit true checks.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <code className="text-xs block bg-muted p-2 rounded">{'col["Active"] === true'}</code>
                          <code className="text-xs block bg-muted p-2 rounded mt-1">{'!col["Deleted"]'}</code>
                          <code className="text-xs block bg-muted p-2 rounded mt-1">{'col["Status"] === "1" || col["Active"] === true'}</code>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground mb-1 flex items-center justify-between">
                            {t('columnMapper.filter.strings')}:
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-[220px]">Use string methods like includes(), startsWith(), or endsWith(). Convert to lowercase for case-insensitive comparisons.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <code className="text-xs block bg-muted p-2 rounded">{'col["Name"].includes("John")'}</code>
                          <code className="text-xs block bg-muted p-2 rounded mt-1">{'col["Email"].toLowerCase().endsWith("@gmail.com")'}</code>
                          <code className="text-xs block bg-muted p-2 rounded mt-1">{'col["Phone"].replace(/[^0-9]/g, "").length === 10'}</code>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground mb-1 flex items-center justify-between">
                            {t('columnMapper.filter.emptyChecks')}:
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-[220px]">Check for empty strings, null, or undefined values. Use trim() to ignore whitespace in strings.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <code className="text-xs block bg-muted p-2 rounded">{'!col["Notes"] || col["Notes"].trim() === ""'}</code>
                          <code className="text-xs block bg-muted p-2 rounded mt-1">{'col["Optional"] !== null && col["Optional"] !== undefined'}</code>
                          <code className="text-xs block bg-muted p-2 rounded mt-1">{'col["Required"]?.length > 0'}</code>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground mb-1 flex items-center justify-between">
                            Complex Conditions:
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-[220px]">Combine multiple conditions with && (AND) and || (OR). Use parentheses to group conditions.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <code className="text-xs block bg-muted p-2 rounded">{'col["Status"].toLowerCase().includes("pending") && col["Priority"] === "high"'}</code>
                          <code className="text-xs block bg-muted p-2 rounded mt-1">{'Number(col["Total"]) > 1000 || (col["VIP"] === true && Number(col["Total"]) > 500)'}</code>
                          <code className="text-xs block bg-muted p-2 rounded mt-1">{'["draft", "review"].includes(col["Status"].toLowerCase())'}</code>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground mb-1 flex items-center justify-between">
                            {t('columnMapper.filter.columnComparisons')}:
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-[220px]">Compare values from different columns. Useful for validation and complex business rules.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <code className="text-xs block bg-muted p-2 rounded">{'Number(col["Actual"]) > Number(col["Target"]) * 1.1'}</code>
                          <code className="text-xs block bg-muted p-2 rounded mt-1">{'col["Password"] === col["ConfirmPassword"]'}</code>
                          <code className="text-xs block bg-muted p-2 rounded mt-1">{'col["EndDate"] > col["StartDate"] && col["Status"] !== "Cancelled"'}</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        ) : (
          <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-2">
            {groups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <PM7Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleGroupType(groupIndex)}
                  >
                    {group.type === 'AND' ? t('columnMapper.filter.andGroup') : t('columnMapper.filter.orGroup')}
                  </PM7Button>
                  {groupIndex > 0 && (
                    <PM7Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCondition(groupIndex, 0)}
                    >
                      <X className="h-4 w-4" />
                    </PM7Button>
                  )}
                </div>
                <div className="space-y-4">
                  {group.conditions.map((condition, conditionIndex) => (
                    <FilterCondition
                      key={conditionIndex}
                      condition={condition}
                      onChange={(newCondition) => handleUpdateCondition(groupIndex, conditionIndex, newCondition)}
                      onRemove={() => handleRemoveCondition(groupIndex, conditionIndex)}
                      sourceColumns={sourceColumns}
                      showRemove={group.conditions.length > 1}
                    />
                  ))}
                </div>
                <PM7Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddCondition(groupIndex)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('columnMapper.filter.addCondition')}
                </PM7Button>
              </div>
            ))}
            <PM7Button
              variant="outline"
              onClick={handleAddGroup}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('columnMapper.filter.addOrGroup')}
            </PM7Button>
          </div>
        )}
        <PM7DialogFooter>
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              <PM7Button
                type="button"
                variant="outline"
                disabled={isFilterEmpty}
                onClick={() => {
                  if (!showClearConfirm) {
                    setShowClearConfirm(true);
                    return;
                  }
                }}
                className="hover:text-red-600 relative disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <span>{t('columnMapper.filter.clearFilter')}</span>
                  {showClearConfirm && (
                    <div className="flex gap-1 border-l pl-2 ml-2">
                      <PM7Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 hover:bg-red-100 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          resetToDefault();
                          onApplyFilter(null);
                          onClose();
                        }}
                      >
                        {t('columnMapper.filter.yes')}
                      </PM7Button>
                      <PM7Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowClearConfirm(false);
                        }}
                      >
                        {t('columnMapper.filter.no')}
                      </PM7Button>
                    </div>
                  )}
                </div>
              </PM7Button>
              {isAdvancedMode && (
                <PM7Button
                  type="button"
                  variant="outline"
                  onClick={handleTest}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {t('columnMapper.filter.testExpression')}
                </PM7Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <PM7Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                {t('dialogs.cancel')}
              </PM7Button>
              <PM7Button
                type="submit"
                onClick={handleApply}
                disabled={!isValid}
                variant="primary"
              >
                {t('columnMapper.filter.applyFilter')}
              </PM7Button>
            </div>
          </div>
        </PM7DialogFooter>
      </PM7DialogContent>
    </PM7Dialog>
  );
};