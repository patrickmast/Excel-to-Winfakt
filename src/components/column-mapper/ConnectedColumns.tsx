import { ArrowRight, X } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';
import ColumnSettingsDialog from './ColumnSettingsDialog';
import { VanillaCard, VanillaCardContent, VanillaCardHeader, VanillaCardTitle } from '../vanilla/react/VanillaCard';
import ColumnPreview from './ColumnPreview';

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

  const handleDisconnect = (uniqueKey: string) => {
    if (onDisconnect) {
      onDisconnect(uniqueKey);
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
    </VanillaCard>
  );
};

export default ConnectedColumns;