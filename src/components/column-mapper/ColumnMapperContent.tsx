import React from 'react';
import { Card } from '@/components/ui/card';
import FileUpload from '../FileUpload';
import ColumnList from './ColumnList';
import ConnectedColumns from './ConnectedColumns';
import ColumnSelector from './ColumnSelector';
import { MappingState } from './types';
import { Button } from '@/components/ui/button';
import { Save, Upload } from 'lucide-react';

interface ColumnMapperContentProps {
  state: MappingState;
  updateState: (updates: Partial<MappingState>) => void;
  targetColumns: string[];
  activeColumnSet: 'artikelen' | 'klanten';
  onColumnSetChange: (value: 'artikelen' | 'klanten') => void;
  onDataLoaded: (columns: string[], data: any[]) => void;
  onExport: () => void;
}

const ColumnMapperContent: React.FC<ColumnMapperContentProps> = ({
  state,
  updateState,
  targetColumns,
  activeColumnSet,
  onColumnSetChange,
  onDataLoaded,
  onExport,
}) => {
  const handleFileData = (columns: string[], data: any[]) => {
    onDataLoaded(columns, data);
  };

  const isColumnMapped = (column: string) => {
    return Object.entries(state.mapping).some(([key, value]) => 
      key.split('_')[0] === column || value === column
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Source Columns</h3>
          <FileUpload onDataLoaded={handleFileData} currentMapping={state.mapping}>
            <Button className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </Button>
          </FileUpload>
          {state.sourceColumns.length > 0 && (
            <ColumnList
              title="Source file columns"
              columns={state.sourceColumns}
              searchValue={state.sourceSearch}
              onSearchChange={(value) => updateState({ sourceSearch: value })}
              selectedColumn={state.selectedSourceColumn}
              onColumnClick={(column) => updateState({ selectedSourceColumn: column })}
              isColumnMapped={isColumnMapped}
              searchPlaceholder="Search source columns..."
            />
          )}
        </div>
      </Card>

      <Card className="p-4">
        <ConnectedColumns
          connectedColumns={Object.entries(state.mapping).map(([key, value]) => [
            key,
            key.split('_')[0],
            value
          ])}
          onDisconnect={(uniqueKey) => {
            const newMapping = { ...state.mapping };
            delete newMapping[uniqueKey];
            updateState({ mapping: newMapping });
          }}
          onUpdateTransform={(uniqueKey, code) => {
            updateState({
              columnTransforms: {
                ...state.columnTransforms,
                [uniqueKey]: code
              }
            });
          }}
          columnTransforms={state.columnTransforms}
          sourceColumns={state.sourceColumns}
          sourceData={state.sourceData}
        />
      </Card>

      <Card className="p-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Target Columns</h3>
          <ColumnSelector
            sourceColumns={state.sourceColumns}
            sourceData={state.sourceData}
            onColumnSelect={(column) => updateState({ selectedTargetColumn: column })}
          />
          <ColumnList
            title="Target columns"
            columns={targetColumns}
            searchValue={state.targetSearch}
            onSearchChange={(value) => updateState({ targetSearch: value })}
            selectedColumn={state.selectedTargetColumn}
            onColumnClick={(column) => updateState({ selectedTargetColumn: column })}
            isColumnMapped={isColumnMapped}
            searchPlaceholder="Search target columns..."
          />
          {state.sourceColumns.length > 0 && (
            <Button 
              className="w-full"
              onClick={onExport}
            >
              <Save className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ColumnMapperContent;