import { ArrowRight, X, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';
import ColumnSettingsDialog from './ColumnSettingsDialog';
import { CardHeader, CardTitle } from '../ui/card';
import ColumnPreview from './ColumnPreview';

interface ConnectedColumnsProps {
  connectedColumns: [string, string][];
  onDisconnect?: (source: string) => void;
  onExport?: () => void;
  onUpdateTransform?: (column: string, code: string) => void;
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

  const handleDisconnect = (source: string) => {
    if (onDisconnect) {
      onDisconnect(source);
    }
  };

  const getPreviewValue = (column: string): string | null => {
    if (!sourceData?.length) return null;

    const firstRow = sourceData[0];
    let value = firstRow[column];

    if (columnTransforms[column]) {
      try {
        const transform = new Function('value', 'row', `return ${columnTransforms[column]}`);
        value = transform(value, firstRow);
      } catch (error) {
        console.error(`Error computing preview for ${column}:`, error);
        value = 'Error in transform';
      }
    }

    return value !== undefined ? String(value) : null;
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Connected columns</CardTitle>
        </CardHeader>
        {onExport && (
          <Button 
            onClick={onExport}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={connectedColumns.length === 0}
          >
            Export CSV
          </Button>
        )}
      </div>
      {connectedColumns.length > 0 && (
        <div className="w-full space-y-2 mt-4">
          {connectedColumns.map(([source, target]) => (
            <div 
              key={source} 
              className="flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <ColumnPreview
                  columnName={source}
                  previewValue={getPreviewValue(source)}
                  onClick={() => setSelectedColumn(source)}
                />
              </div>
              <div className="flex-shrink-0 group">
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:hidden" />
                <X 
                  className="h-4 w-4 text-red-500 hidden group-hover:block cursor-pointer" 
                  onClick={() => handleDisconnect(source)}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-[#F0FEF5] p-4 rounded-md border border-[#BBF7D0]">
                  <p className="truncate text-sm font-medium">{target}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedColumn && (
        <ColumnSettingsDialog
          isOpen={!!selectedColumn}
          onClose={() => setSelectedColumn(null)}
          columnName={selectedColumn}
          initialCode={columnTransforms[selectedColumn] || ''}
          onSave={(code) => {
            onUpdateTransform?.(selectedColumn, code);
            setSelectedColumn(null);
          }}
          sourceColumns={sourceColumns}
        />
      )}
    </div>
  );
};

export default ConnectedColumns;