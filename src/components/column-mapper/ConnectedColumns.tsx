import { ArrowRight, X, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';
import ColumnSettingsDialog from './ColumnSettingsDialog';
import { CardHeader, CardTitle } from '../ui/card';

interface ConnectedColumnsProps {
  connectedColumns: [string, string][];
  onDisconnect?: (source: string) => void;
  onExport?: () => void;
  onUpdateTransform?: (column: string, code: string) => void;
  columnTransforms?: Record<string, string>;
  sourceColumns: string[];
}

const ConnectedColumns = ({ 
  connectedColumns, 
  onDisconnect, 
  onExport,
  onUpdateTransform,
  columnTransforms = {},
  sourceColumns = []
}: ConnectedColumnsProps) => {
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

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
                <div className="bg-[#F0FEF5] p-4 rounded-md border border-[#BBF7D0] relative">
                  <p className="truncate text-sm font-medium pr-8">{source}</p>
                  <button
                    onClick={() => setSelectedColumn(source)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-green-100 rounded-md transition-colors"
                  >
                    <Settings className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="flex-shrink-0 group">
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:hidden" />
                <X 
                  className="h-4 w-4 text-red-500 hidden group-hover:block cursor-pointer" 
                  onClick={() => onDisconnect?.(source)}
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