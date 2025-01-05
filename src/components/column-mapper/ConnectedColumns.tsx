import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import ColumnSettingsDialog from './ColumnSettingsDialog';
import ConnectedColumnBox from './ConnectedColumnBox';

interface ConnectedColumnsProps {
  connectedColumns: [string, string][];
  onDisconnect: (column: string) => void;
  onExport: () => void;
  onUpdateTransform: (column: string, code: string) => void;
  columnTransforms: Record<string, string>;
  sourceColumns: string[];
}

const ConnectedColumns: React.FC<ConnectedColumnsProps> = ({
  connectedColumns,
  onDisconnect,
  onExport,
  onUpdateTransform,
  columnTransforms,
  sourceColumns,
}) => {
  const [selectedColumn, setSelectedColumn] = React.useState<string | null>(null);

  const getPreviewValue = (sourceColumn: string) => {
    if (!columnTransforms[sourceColumn]) return sourceColumn;

    try {
      // Create sample data based on column names
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

      const value = row[sourceColumn];
      // eslint-disable-next-line no-new-func
      const transform = new Function('value', 'row', `return ${columnTransforms[sourceColumn]}`);
      return String(transform(value, row));
    } catch (error) {
      return 'Error in transform';
    }
  };

  return (
    <div>
      <div className="space-y-2">
        {connectedColumns.map(([source, target]) => (
          <div key={source} className="flex items-center space-x-2">
            <ConnectedColumnBox
              sourceColumn={source}
              targetColumn={target}
              onDisconnect={() => onDisconnect(source)}
              previewValue={getPreviewValue(source)}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedColumn(source)}
              className="h-8 w-8"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {selectedColumn && (
        <ColumnSettingsDialog
          isOpen={!!selectedColumn}
          onClose={() => setSelectedColumn(null)}
          columnName={selectedColumn}
          onSave={(code) => {
            onUpdateTransform(selectedColumn, code);
            setSelectedColumn(null);
          }}
          initialCode={columnTransforms[selectedColumn] || ''}
          sourceColumns={sourceColumns}
        />
      )}

      {connectedColumns.length > 0 && (
        <div className="mt-4">
          <Button onClick={onExport} className="w-full">
            Export
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConnectedColumns;