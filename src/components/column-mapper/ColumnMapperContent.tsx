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
              columns={state.sourceColumns}
              searchTerm={state.sourceSearch}
              onSearchChange={(value) => updateState({ sourceSearch: value })}
              selectedColumn={state.selectedSourceColumn}
              onColumnSelect={(column) => updateState({ selectedSourceColumn: column })}
            />
          )}
        </div>
      </Card>

      <Card className="p-4">
        <ConnectedColumns
          mapping={state.mapping}
          columnTransforms={state.columnTransforms}
          onMappingChange={(mapping) => updateState({ mapping })}
          onTransformChange={(transforms) => updateState({ columnTransforms: transforms })}
        />
      </Card>

      <Card className="p-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Target Columns</h3>
          <ColumnSelector
            value={activeColumnSet}
            onChange={onColumnSetChange}
          />
          <ColumnList
            columns={targetColumns}
            searchTerm={state.targetSearch}
            onSearchChange={(value) => updateState({ targetSearch: value })}
            selectedColumn={state.selectedTargetColumn}
            onColumnSelect={(column) => updateState({ selectedTargetColumn: column })}
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