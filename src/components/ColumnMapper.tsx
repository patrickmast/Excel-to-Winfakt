import { useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import ConnectedColumns from './column-mapper/ConnectedColumns';
import ColumnList from './column-mapper/ColumnList';
import FileUpload from './FileUpload';
import { Button } from './ui/button';
import { Upload } from 'lucide-react';
import { downloadCSV } from '@/utils/csvUtils';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColumnMapperProps } from './column-mapper/types';
import { useMappingState } from './column-mapper/useMappingState';

const ColumnMapper = ({ 
  targetColumns, 
  onMappingChange, 
  onExport, 
  onDataLoaded,
  activeColumnSet,
  onColumnSetChange 
}: ColumnMapperProps) => {
  const [state, updateState] = useMappingState(onMappingChange);
  
  // Reset mapping when column set changes
  useEffect(() => {
    updateState({
      mapping: {},
      columnTransforms: {}
    });
  }, [activeColumnSet]);

  const handleSourceColumnClick = (column: string) => {
    if (state.selectedSourceColumn === column) {
      updateState({ selectedSourceColumn: null });
    } else {
      updateState({ selectedSourceColumn: column });
      if (state.selectedTargetColumn) {
        const uniqueKey = `${column}_${state.connectionCounter}`;
        updateState({
          mapping: {
            ...state.mapping,
            [uniqueKey]: state.selectedTargetColumn
          },
          connectionCounter: state.connectionCounter + 1,
          selectedSourceColumn: null,
          selectedTargetColumn: null,
          sourceSearch: '',
          targetSearch: ''
        });
      }
    }
  };

  const handleTargetColumnClick = (targetColumn: string) => {
    if (state.selectedTargetColumn === targetColumn) {
      updateState({ selectedTargetColumn: null });
    } else {
      updateState({ selectedTargetColumn: targetColumn });
      if (state.selectedSourceColumn) {
        const uniqueKey = `${state.selectedSourceColumn}_${state.connectionCounter}`;
        updateState({
          mapping: {
            ...state.mapping,
            [uniqueKey]: targetColumn
          },
          connectionCounter: state.connectionCounter + 1,
          selectedSourceColumn: null,
          selectedTargetColumn: null,
          sourceSearch: '',
          targetSearch: ''
        });
      }
    }
  };

  const handleDisconnect = (sourceColumn: string) => {
    const newMapping = { ...state.mapping };
    delete newMapping[sourceColumn];
    const newTransforms = { ...state.columnTransforms };
    delete newTransforms[sourceColumn];
    updateState({
      mapping: newMapping,
      columnTransforms: newTransforms
    });
  };

  const handleFileData = (columns: string[], data: any[]) => {
    updateState({
      sourceColumns: columns,
      sourceData: data
    });
    onDataLoaded(data);
  };

  const handleExport = () => {
    const transformedData = state.sourceData.map(row => {
      const newRow: Record<string, any> = {};
      Object.entries(state.mapping).forEach(([source, target]) => {
        const sourceColumn = source.split('_')[0];
        let value = row[sourceColumn];
        
        // Apply transform if it exists
        if (state.columnTransforms[sourceColumn]) {
          try {
            // Create a function that has access to all columns in the row
            const transform = new Function('value', 'row', `return ${state.columnTransforms[sourceColumn]}`);
            value = transform(value, row);
          } catch (error) {
            console.error(`Error transforming column ${sourceColumn}:`, error);
          }
        }
        
        newRow[target] = value;
      });
      return newRow;
    });
    
    downloadCSV(transformedData, 'converted.csv');
    toast({
      title: "Export successful",
      description: "Your file has been converted and downloaded",
    });
  };

  const connectedColumns = Object.entries(state.mapping).map(([key, target]) => {
    const sourceColumn = key.split('_')[0];
    return [sourceColumn, target] as [string, string];
  }).filter(([_, target]) => target !== '');

  const mappedTargetColumns = new Set(Object.values(state.mapping));

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg border border-gray-200 py-4 px-6">
        <ConnectedColumns 
          connectedColumns={connectedColumns} 
          onDisconnect={handleDisconnect}
          onExport={handleExport}
          onUpdateTransform={(column, code) => {
            updateState({
              columnTransforms: {
                ...state.columnTransforms,
                [column]: code
              }
            });
          }}
          columnTransforms={state.columnTransforms}
          sourceColumns={state.sourceColumns}
        />
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-8">
            <ColumnList
              title={
                <div className="flex items-center justify-between">
                  <span>Source file columns</span>
                  <FileUpload onDataLoaded={handleFileData}>
                    <Button variant="outline" size="default" className="ml-2 h-10">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload file
                    </Button>
                  </FileUpload>
                </div>
              }
              columns={state.sourceColumns}
              searchValue={state.sourceSearch}
              onSearchChange={(value) => updateState({ sourceSearch: value })}
              selectedColumn={state.selectedSourceColumn}
              onColumnClick={handleSourceColumnClick}
              isColumnMapped={(column) => false}
              searchPlaceholder="Search source columns..."
            />
            <ColumnList
              title={
                <div className="flex items-center justify-between">
                  <span>Winfakt columns</span>
                  <Select value={activeColumnSet} onValueChange={onColumnSetChange}>
                    <SelectTrigger className="w-[140px] ml-2 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="artikelen">Artikelen</SelectItem>
                      <SelectItem value="klanten">Klanten</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              }
              columns={targetColumns}
              searchValue={state.targetSearch}
              onSearchChange={(value) => updateState({ targetSearch: value })}
              selectedColumn={state.selectedTargetColumn}
              onColumnClick={handleTargetColumnClick}
              isColumnMapped={(column) => mappedTargetColumns.has(column)}
              searchPlaceholder="Search Winfakt columns..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ColumnMapper;