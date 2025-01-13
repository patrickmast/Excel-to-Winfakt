import { Card, CardContent } from '../ui/card';
import ConnectedColumns from './ConnectedColumns';
import ColumnList from './ColumnList';
import Header from './Header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MappingState } from './types';
import VersionDisplay from '../VersionDisplay';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface ColumnMapperContentProps {
  state: MappingState;
  updateState: (updates: Partial<MappingState>) => void;
  targetColumns: string[];
  activeColumnSet: 'artikelen' | 'klanten';
  onColumnSetChange: (value: 'artikelen' | 'klanten') => void;
  onDataLoaded: (columns: string[], data: any[]) => void;
  onExport: () => void;
}

const ColumnMapperContent = ({
  state,
  updateState,
  targetColumns,
  activeColumnSet,
  onColumnSetChange,
  onDataLoaded,
  onExport
}: ColumnMapperContentProps) => {
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
    const newTransforms = { ...state.columnTransforms };
    delete newMapping[sourceColumn];
    delete newTransforms[sourceColumn];
    updateState({
      mapping: newMapping,
      columnTransforms: newTransforms
    });
  };

  const connectedColumns = Object.entries(state.mapping).map(([key, target]) => {
    const sourceColumn = key.split('_')[0];
    return [key, sourceColumn, target] as [string, string, string];
  }).filter(([_, __, target]) => target !== '');

  const mappedTargetColumns = new Set(Object.values(state.mapping));

  return (
    <div>
      <div className="bg-white rounded-lg border border-gray-200 py-4 px-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <ConnectedColumns
            connectedColumns={connectedColumns}
            onDisconnect={handleDisconnect}
            onExport={onExport}
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
        </div>
      </div>

      <Card className="mb-0">
        <CardContent className="p-6 pb-4">
          <div className="grid grid-cols-2 gap-8">
            <ColumnList
              title={
                <Header
                  activeColumnSet={activeColumnSet}
                  onColumnSetChange={onColumnSetChange}
                  onDataLoaded={onDataLoaded}
                  currentMapping={state.mapping}
                />
              }
              columns={state.sourceColumns}
              searchValue={state.sourceSearch}
              onSearchChange={(value) => updateState({ sourceSearch: value })}
              selectedColumn={state.selectedSourceColumn}
              onColumnClick={handleSourceColumnClick}
              isColumnMapped={(column) => false}
              searchPlaceholder="Search source columns..."
              columnTransforms={state.columnTransforms}
              sourceData={state.sourceData}
            />
            <ColumnList
              title={
                <div className="flex items-center justify-between">
                  <span>Winfakt columns</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="default" className="ml-2">
                        {activeColumnSet === 'artikelen' ? 'Artikelen' : 'Klanten'}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[140px]">
                      <DropdownMenuItem onClick={() => onColumnSetChange('artikelen')}>
                        Artikelen
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onColumnSetChange('klanten')}>
                        Klanten
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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

      <div className="text-xs text-gray-300 ml-[0.4rem] mt-[0.2rem]">
        <VersionDisplay />
      </div>
    </div>
  );
};

export default ColumnMapperContent;