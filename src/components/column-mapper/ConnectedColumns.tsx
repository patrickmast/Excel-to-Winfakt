import { ArrowRight, X, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import ColumnSettingsDialog from './ColumnSettingsDialog';
import { VanillaCard, VanillaCardContent, VanillaCardHeader, VanillaCardTitle } from '../vanilla/react/VanillaCard';
import ColumnPreview from './ColumnPreview';
import '../vanilla/Button.css';
import { FilterDialog, CompoundFilter, SingleCondition } from './FilterDialog';
import { Badge } from '@/components/ui/badge';

interface ConnectedColumnsProps {
  connectedColumns: [string, string, string][]; // [uniqueKey, sourceColumn, targetColumn]
  onDisconnect?: (source: string) => void;
  onExport?: () => void;
  onUpdateTransform?: (uniqueKey: string, code: string) => void;
  columnTransforms?: Record<string, string>;
  sourceColumns: string[];
  sourceData?: any[];
}

const ConnectedColumns = ({
  connectedColumns,
  onDisconnect,
  onExport,
  onUpdateTransform,
  columnTransforms = {},
  sourceColumns = [],
  sourceData = []
}: ConnectedColumnsProps) => {
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [activeFilter, setActiveFilter] = useState<CompoundFilter | null>(null);

  const handleDisconnect = (uniqueKey: string) => {
    if (onDisconnect) {
      onDisconnect(uniqueKey);
    }
  };

  const handleApplyFilter = (filter: CompoundFilter) => {
    setActiveFilter(filter);
  };

  const handleExport = () => {
    if (!onExport) return;

    // If there's an active filter, apply it before exporting
    if (activeFilter && sourceData) {
      let filteredData;

      if (activeFilter.advancedMode && activeFilter.expression) {
        try {
          // Create a safe function from the expression
          const filterFn = new Function('row', `
            const getValue = (val) => {
              if (val === null || val === undefined) return '';
              if (val instanceof Date) return val;
              if (typeof val === 'boolean') return val;
              if (typeof val === 'number') return val;
              // Try to parse date strings
              if (typeof val === 'string') {
                const date = new Date(val);
                if (!isNaN(date.getTime())) return date;
              }
              return String(val);
            };
            return ${activeFilter.expression};
          `);
          filteredData = sourceData.filter(row => {
            try {
              return filterFn(row);
            } catch (err) {
              console.error('Error evaluating filter expression for row:', err);
              return false;
            }
          });
        } catch (err) {
          console.error('Error creating filter function:', err);
          return;
        }
      } else {
        // Basic mode filtering
        filteredData = sourceData.filter(row => {
          // Skip rows that don't match our filter criteria
          const shouldKeepRow = activeFilter.groups.every(group => {
            const groupResult = group.type === 'AND'
              ? group.conditions.every(condition => evaluateCondition(condition, row))
              : group.conditions.some(condition => evaluateCondition(condition, row));
            return groupResult;
          });

          console.log('Row decision:', {
            row,
            shouldKeep: shouldKeepRow
          });

          return shouldKeepRow;
        });

        function evaluateCondition(condition: SingleCondition, row: any) {
          function getValue(val: any): any {
            if (val === null || val === undefined) return '';
            if (val instanceof Date) return val;
            if (typeof val === 'boolean') return val;
            if (typeof val === 'number') return val;
            // Try to parse date strings
            if (typeof val === 'string') {
              const date = new Date(val);
              if (!isNaN(date.getTime())) return date;
            }
            return String(val);
          }

          const value = getValue(row[condition.column]);
          const typedFilterValue: any = (() => {
            if (typeof value === 'number') return Number(condition.value);
            if (value instanceof Date) return new Date(condition.value);
            if (typeof value === 'boolean') return condition.value === 'true';
            return condition.value;
          })();

          function compareValues(a: any, b: any): number {
            if (a instanceof Date && b instanceof Date) {
              return a.getTime() - b.getTime();
            }
            if (typeof a === 'number' && typeof b === 'number') {
              return a - b;
            }
            return String(a).localeCompare(String(b));
          }

          switch (condition.operator) {
            case 'equals':
              if (value instanceof Date && typedFilterValue instanceof Date) {
                return value.getTime() === typedFilterValue.getTime();
              }
              return value === typedFilterValue;
            case 'contains':
              return String(value).includes(String(typedFilterValue));
            case 'startsWith':
              return String(value).startsWith(String(typedFilterValue));
            case 'endsWith':
              return String(value).endsWith(String(typedFilterValue));
            case 'greaterThan':
              return compareValues(value, typedFilterValue) > 0;
            case 'lessThan':
              return compareValues(value, typedFilterValue) < 0;
            case 'isEmpty':
              if (value instanceof Date) return false;
              if (typeof value === 'boolean') return false;
              if (typeof value === 'number') return false;
              return !value || String(value).trim() === '';
            case 'isNotEmpty':
              // Debug logging
              console.log('isNotEmpty check for column:', condition.column, {
                rawValue: row[condition.column],
                valueAfterGetValue: value,
                isDate: value instanceof Date,
                isBoolean: typeof value === 'boolean',
                isNumber: typeof value === 'number',
                stringValue: String(value),
                stringValueTrimmed: String(value).trim(),
                wouldPass: (() => {
                  if (value instanceof Date) return true;
                  if (typeof value === 'boolean') return true;
                  if (typeof value === 'number') return true;
                  const str = String(value);
                  return str !== '' && str.trim() !== '';
                })()
              });

              // Special cases for non-string types
              if (value instanceof Date) return true;
              if (typeof value === 'boolean') return true;
              if (typeof value === 'number') return true;
              // For everything else, convert to string and check if it's non-empty after trimming
              const stringValue = String(value);
              return stringValue !== '' && stringValue.trim() !== '';
            default:
              return true;
          }
        }
      }

      console.log('Filtered data:', {
        originalLength: sourceData.length,
        filteredLength: filteredData.length,
        filteredData
      });

      // Create a new array for filtered data to avoid reference issues
      const exportData = [...filteredData];
      onExport();
    } else {
      onExport();
    }
  };

  const getPreviewValue = (uniqueKey: string, sourceColumn: string): string | null => {
    if (!sourceData?.length) return null;

    const firstRow = sourceData[0];
    let value = firstRow[sourceColumn];

    // Apply transform if it exists
    if (columnTransforms[uniqueKey]) {
      try {
        const transform = new Function('value', 'row', `return ${columnTransforms[uniqueKey]}`);
        value = transform(value, firstRow);
      } catch (error) {
        console.error(`Error computing preview for ${sourceColumn}:`, error);
        value = 'Error in transform';
      }
    }

    return value !== undefined ? String(value) : null;
  };

  return (
    <VanillaCard className="w-full bg-white rounded-lg border border-gray-200 py-4">
      <VanillaCardHeader className="px-6 py-0">
        <div className="flex items-center justify-between w-full">
          <VanillaCardTitle className="text-xl font-semibold">Connected columns</VanillaCardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowFilterDialog(true)}
              disabled={true}
              variant="outline"
              className={activeFilter ? "border-blue-500 text-blue-500" : ""}
            >
              <Filter className="h-4 w-4 mr-2" />
              {activeFilter ? "Filter Active" : "Filter"}
            </Button>
            {onExport && (
              <Button
                onClick={handleExport}
                disabled={connectedColumns.length === 0}
                className="bg-[#1C86EF] hover:bg-[#0E5DA8] text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </div>
      </VanillaCardHeader>

      {connectedColumns.length > 0 && (
        <VanillaCardContent className="w-full space-y-2 mt-4 px-6">
          {connectedColumns.map(([uniqueKey, sourceColumn, targetColumn]) => (
            <div
              key={uniqueKey}
              className="flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <ColumnPreview
                  columnName={sourceColumn}
                  previewValue={getPreviewValue(uniqueKey, sourceColumn)}
                  onClick={() => setSelectedColumn(uniqueKey)}
                  showSettings={true}
                />
              </div>
              <div className="flex-shrink-0 group">
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:hidden" />
                <X
                  className="h-4 w-4 text-red-500 hidden group-hover:block cursor-pointer"
                  onClick={() => handleDisconnect(uniqueKey)}
                />
              </div>
              <div className="flex-1 min-w-0">
                <ColumnPreview
                  columnName={targetColumn}
                  className="bg-[#F0FEF5] border border-[#BBF7D0]"
                />
              </div>
            </div>
          ))}
        </VanillaCardContent>
      )}
      {selectedColumn && (
        <ColumnSettingsDialog
          isOpen={!!selectedColumn}
          onClose={() => setSelectedColumn(null)}
          columnName={connectedColumns.find(([key]) => key === selectedColumn)?.[1] || ''}
          initialCode={columnTransforms[selectedColumn] || ''}
          onSave={(code) => {
            onUpdateTransform?.(selectedColumn, code);
            setSelectedColumn(null);
          }}
          sourceColumns={sourceColumns}
          sourceData={sourceData}
        />
      )}
      <FilterDialog
        isOpen={showFilterDialog}
        onClose={() => setShowFilterDialog(false)}
        sourceColumns={sourceColumns}
        onApplyFilter={handleApplyFilter}
        sourceData={sourceData}
      />
    </VanillaCard>
  );
};

export default ConnectedColumns;