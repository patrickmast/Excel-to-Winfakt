import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Code, Play, HelpCircle } from 'lucide-react';
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

const operators = [
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'startsWith', label: 'Starts with' },
  { value: 'endsWith', label: 'Ends with' },
  { value: 'greaterThan', label: 'Greater than' },
  { value: 'lessThan', label: 'Less than' },
  { value: 'isEmpty', label: 'Is empty' },
  { value: 'isNotEmpty', label: 'Is not empty' },
];

interface FilterConditionProps {
  condition: SingleCondition;
  onChange: (condition: SingleCondition) => void;
  onRemove: () => void;
  sourceColumns: string[];
  showRemove: boolean;
}

const FilterCondition = ({ condition, onChange, onRemove, sourceColumns, showRemove }: FilterConditionProps) => {
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
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-10 w-10 shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
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
  const [groups, setGroups] = useState<FilterGroup[]>(() => 
    initialFilter?.groups ?? [{
      conditions: [{
        column: sourceColumns[0] || '',
        operator: 'equals',
        value: ''
      }],
      type: 'AND'
    }]
  );
  
  const [isAdvancedMode, setIsAdvancedMode] = useState(initialFilter?.advancedMode ?? false);
  const [expression, setExpression] = useState(initialFilter?.expression ?? '');
  const [activeTab, setActiveTab] = useState<'expression' | 'examples'>('expression');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [hasBeenTested, setHasBeenTested] = useState(false);

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
      conditions: [{
        column: sourceColumns[0] || '',
        operator: 'equals',
        value: ''
      }],
      type: 'AND'
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
        const filterFn = new Function('row', `return ${expression}`);

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
          setTestError("Expression must return a boolean value (true/false)");
          return;
        }

        // If there's no data or empty array, just show the result
        if (!sourceData || !Array.isArray(sourceData) || sourceData.length === 0) {
          console.log('Source data status:', {
            exists: !!sourceData,
            isArray: Array.isArray(sourceData),
            length: sourceData?.length
          });
          setTestResult(`Test result: ${result}\n\nNote: No sample data available, tested with empty row object.`);
          setActiveTab('expression');
          return;
        }

        // If we have data, test with the first row
        const row = sourceData[0];
        const resultWithData = filterFn(row);
        setTestResult(`Test result with first row: ${resultWithData}`);
        setActiveTab('expression');
      } catch (error) {
        setTestError("Error evaluating expression: " + (error as Error).message);
      }
    } catch (error) {
      setTestError("Invalid JavaScript expression: " + (error as Error).message);
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
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="pb-0">
          <DialogTitle className="flex items-center justify-between px-4 pb-2">
            <span>Filter Rows</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdvancedMode(!isAdvancedMode)}
              className="flex items-center gap-2"
            >
              <Code className="h-4 w-4" />
              {isAdvancedMode ? 'Switch to Basic' : 'Switch to Advanced'}
            </Button>
          </DialogTitle>
          <DialogDescription className="px-4 pb-1">
            {isAdvancedMode
              ? "Create a custom JavaScript filter expression to filter rows based on their values. Write a JavaScript expression that returns true for rows that should be included. Use row[\"Column Name\"] to access column values."
              : "Create filter conditions to filter rows based on their values."}
          </DialogDescription>
        </DialogHeader>
        {isAdvancedMode ? (
          <div className="flex-1 flex flex-col min-h-0 -mt-1">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as 'expression' | 'examples')}
              className="flex-1 flex flex-col min-h-0"
            >
              <TabsList className="h-10 px-6 justify-start space-x-8 bg-transparent flex-shrink-0">
                <TabsTrigger value="expression">Filter expression</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
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
                            Numbers:
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
                            Dates:
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
                            Booleans:
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
                            Strings:
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
                            Empty/Null Checks:
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
                            Multiple Column Comparisons:
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleGroupType(groupIndex)}
                  >
                    {group.type} Group
                  </Button>
                  {groupIndex > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCondition(groupIndex, 0)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddCondition(groupIndex)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={handleAddGroup}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add OR Group
            </Button>
          </div>
        )}
        <DialogFooter className="flex w-full gap-x-2 px-4 py-2">
          <div className="flex gap-x-2 w-full">
            {isAdvancedMode && (
              <Button
                onClick={handleTest}
                disabled={!expression.trim()}
                variant={expression.trim() ? undefined : "outline"}
                className={`flex items-center gap-2 rounded-md ${
                  expression.trim() ? 'bg-green-600 hover:bg-green-700 text-white' : ''
                }`}
              >
                <Play className="h-4 w-4" />
                Test
              </Button>
            )}
            <div className="flex gap-x-2 ml-auto">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button
                onClick={handleApply}
                disabled={!isValid}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                Apply Filter
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};