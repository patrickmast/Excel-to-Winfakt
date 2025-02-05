import { useCallback, useState } from 'react';
import { VanillaCard, VanillaCardContent } from '../vanilla/react/VanillaCard';
import '@/components/vanilla/Card.css';
import ConnectedColumns from './ConnectedColumns';
import ColumnList from './ColumnList';
import Header from './Header';
import { MappingState } from './types';
import VersionDisplay from '../VersionDisplay';
import { VanillaMenu } from '../vanilla/react/VanillaMenu';
import '@/components/vanilla/Menu.css';
import { downloadCSV, addTimestampToFilename } from '@/utils/csvUtils';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Toaster } from '../../components/ui/toaster';

interface ColumnMapperContentProps {
  state: MappingState;
  updateState: (updates: Partial<MappingState>) => void;
  targetColumns: string[];
  activeColumnSet: string;
  onColumnSetChange: (columnSet: string) => void;
  onDataLoaded: (columns: string[], data: any[], sourceFilename: string, worksheetName?: string, fileSize?: number) => void;
  onExport: () => void;
}

interface MappingState {
  sourceData: any[];
  sourceFilename: string;
  exportFilename: string;
  worksheetName?: string;
  fileSize?: number;
  columnTransforms: Record<string, string>;
  mapping: Record<string, string>;
  connectionCounter: number;
  selectedSourceColumn: string | null;
  selectedTargetColumn: string | null;
  sourceColumns: string[];
  sourceSearch: string;
  targetSearch: string;
  activeFilter: string;
  isLoading: boolean;
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
  const [showNoFileDialog, setShowNoFileDialog] = useState(false);

  const handleDataLoaded = useCallback((columns: string[], data: any[], sourceFilename: string, worksheetName?: string, fileSize?: number) => {
    onDataLoaded(columns, data, sourceFilename, worksheetName, fileSize);
  }, [onDataLoaded]);

  const handleLoadingChange = useCallback((loading: boolean) => {
    updateState({ isLoading: loading });
  }, [updateState]);

  const handleSourceColumnClick = useCallback((column: string) => {
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
          selectedTargetColumn: null
        });
      }
    }
  }, [state.selectedSourceColumn, state.selectedTargetColumn, state.connectionCounter, state.mapping, updateState]);

  const handleTargetColumnClick = useCallback((targetColumn: string) => {
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
          selectedTargetColumn: null
        });
      }
    }
  }, [state.selectedTargetColumn, state.selectedSourceColumn, state.connectionCounter, state.mapping, updateState]);

  const handleDisconnect = useCallback((sourceColumn: string) => {
    const newMapping = { ...state.mapping };
    const newTransforms = { ...state.columnTransforms };
    delete newMapping[sourceColumn];
    delete newTransforms[sourceColumn];
    updateState({
      mapping: newMapping,
      columnTransforms: newTransforms
    });
  }, [state.mapping, state.columnTransforms, updateState]);

  const handleSearchChange = useCallback((type: 'source' | 'target', value: string) => {
    updateState(type === 'source' ? { sourceSearch: value } : { targetSearch: value });
  }, [updateState]);

  const handleReorder = useCallback((newOrder: [string, string, string][]) => {
    const newMapping: Record<string, string> = {};
    newOrder.forEach(([key, _, target]) => {
      newMapping[key] = target;
    });
    updateState({ mapping: newMapping });
  }, [updateState]);

  const connectedColumns = Object.entries(state.mapping).map(([key, target]) => {
    const sourceColumn = key.split('_')[0];
    return [key, sourceColumn, target] as [string, string, string];
  }).filter(([_, __, target]) => target !== '');

  const mappedTargetColumns = new Set(Object.values(state.mapping));

  const columnSetItems = [
    {
      value: 'artikelen',
      label: 'Artikelen',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          {activeColumnSet === 'artikelen' && (
            <path d="M9 12l2 2 4-4" />
          )}
        </svg>
      )
    },
    {
      value: 'klanten',
      label: 'Klanten',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          {activeColumnSet === 'klanten' && (
            <path d="M9 12l2 2 4-4" />
          )}
        </svg>
      )
    }
  ];

  const handleExport = () => {
    if (!state.sourceFilename) {
      setShowNoFileDialog(true);
      return;
    }
    
    // If no export filename is set, use the source filename
    const exportFilename = state.exportFilename || state.sourceFilename;
    
    downloadCSV(
      state.sourceData, 
      exportFilename, 
      state.sourceFilename, 
      state.worksheetName, 
      state.fileSize
    );
  };

  return (
    <div>
      <div className="mb-8">
        <ConnectedColumns
          connectedColumns={connectedColumns}
          onDisconnect={handleDisconnect}
          onExport={handleExport}
          onUpdateTransform={(uniqueKey, code) => {
            updateState({
              columnTransforms: {
                ...state.columnTransforms,
                [uniqueKey]: code
              }
            });
          }}
          onReorder={handleReorder}
          columnTransforms={state.columnTransforms}
          sourceColumns={state.sourceColumns}
          sourceData={state.sourceData}
          activeFilter={state.activeFilter}
          onFilterChange={(filter) => updateState({ activeFilter: filter })}
        />
      </div>

      <VanillaCard className="mb-0">
        <VanillaCardContent className="p-6 pb-4">
          <div className="grid grid-cols-2 gap-8">
            <ColumnList
              title={
                <Header
                  activeColumnSet={activeColumnSet}
                  onColumnSetChange={onColumnSetChange}
                  onDataLoaded={handleDataLoaded}
                  currentMapping={state.mapping}
                  isLoading={state.isLoading}
                  onLoadingChange={handleLoadingChange}
                />
              }
              columns={state.sourceColumns}
              searchValue={state.sourceSearch}
              onSearchChange={(value) => handleSearchChange('source', value)}
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
                  <VanillaMenu
                    items={columnSetItems.map(item => ({
                      label: item.label,
                      icon: item.icon,
                      onClick: () => onColumnSetChange(item.value as 'artikelen' | 'klanten')
                    }))}
                  >
                    {activeColumnSet === 'artikelen' ? 'Artikelen' : 'Klanten'}
                  </VanillaMenu>
                </div>
              }
              columns={targetColumns}
              searchValue={state.targetSearch}
              onSearchChange={(value) => handleSearchChange('target', value)}
              selectedColumn={state.selectedTargetColumn}
              onColumnClick={handleTargetColumnClick}
              isColumnMapped={(column) => mappedTargetColumns.has(column)}
              searchPlaceholder="Search Winfakt columns..."
            />
          </div>
        </VanillaCardContent>
      </VanillaCard>

      <div className="text-xs text-gray-300 ml-[0.4rem] mt-[0.2rem]">
        <VersionDisplay />
      </div>
      <Dialog open={showNoFileDialog} onOpenChange={setShowNoFileDialog}>
        <DialogContent className="p-0 overflow-hidden border-0">
          <div className="bg-slate-700 p-5 rounded-t-lg">
            <DialogTitle className="text-white m-0">No source file selected</DialogTitle>
          </div>
          <div className="py-10 px-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <DialogDescription className="text-slate-600 m-0">
                Please select a source file before exporting to CSV.
              </DialogDescription>
            </div>
          </div>
          <DialogFooter className="p-5 bg-gray-50">
            <Button 
              className="bg-[#3b82f6] hover:bg-[#2563eb] text-white border-0 
                        shadow-none rounded-md px-6"
              onClick={() => setShowNoFileDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
};

export default ColumnMapperContent;