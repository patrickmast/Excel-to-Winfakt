import { useCallback } from 'react';
import { VanillaCard, VanillaCardContent } from '../vanilla/react/VanillaCard';
import '@/components/vanilla/Card.css';
import ConnectedColumns from './ConnectedColumns';
import ColumnList from './ColumnList';
import Header from './Header';
import { MappingState } from './types';
import VersionDisplay from '../VersionDisplay';
import { VanillaMenu } from '../vanilla/react/VanillaMenu';
import '@/components/vanilla/Menu.css';

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
  const handleDataLoaded = useCallback((columns: string[], data: any[]) => {
    onDataLoaded(columns, data);
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

  return (
    <div>
      <div className="mb-8">
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
    </div>
  );
};

export default ColumnMapperContent;