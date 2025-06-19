import { useCallback, useState } from 'react';
import { VanillaCard, VanillaCardContent } from '../vanilla/react/VanillaCard';
import '@/components/vanilla/Card.css';
import ConnectedColumns from './ConnectedColumns';
import ColumnList from './ColumnList';
import Header from './Header';
import { MappingState } from './types';
import { CompoundFilter } from './FilterDialog';
import VersionDisplay from '../VersionDisplay';
import { PM7Menu } from 'pm7-ui-style-guide';
import { downloadCSV, addTimestampToFilename } from '@/utils/csvUtils';
import {
  PM7Dialog,
  PM7DialogContent,
  PM7DialogHeader,
  PM7DialogTitle,
  PM7DialogDescription,
  PM7DialogFooter,
  PM7DialogIcon,
  PM7Button
} from 'pm7-ui-style-guide';
import 'pm7-ui-style-guide/src/components/dialog/pm7-dialog.css';
import { AlertCircle } from 'lucide-react';
import { Toaster } from 'pm7-ui-style-guide';
import { useTranslation } from 'react-i18next';

interface ColumnMapperContentProps {
  state: MappingState;
  updateState: (updates: Partial<MappingState>) => void;
  targetColumns: string[];
  activeColumnSet: string;
  onColumnSetChange: (columnSet: string) => void;
  onDataLoaded: (columns: string[], data: any[], sourceFilename: string, worksheetName?: string, fileSize?: number, metadata?: any) => void;
  onExport: (data: any[], metadata?: any) => void;
  onReorder?: (newOrder: [string, string, string][]) => void;
}

// Using MappingState from types.ts instead of local declaration

const ColumnMapperContent = ({
  state,
  updateState,
  targetColumns,
  activeColumnSet,
  onColumnSetChange,
  onDataLoaded,
  onExport,
  onReorder
}: ColumnMapperContentProps) => {
  const [showNoFileDialog, setShowNoFileDialog] = useState(false);
  const { t } = useTranslation();

  const handleDataLoaded = useCallback((columns: string[], data: any[], sourceFilename: string, worksheetName?: string, fileSize?: number, metadata?: any) => {
    onDataLoaded(columns, data, sourceFilename, worksheetName, fileSize, metadata);
    updateState({
      sourceColumns: columns,
      sourceData: data,
      sourceFilename,
      worksheetName,
      sourceFileSize: fileSize, // Changed to sourceFileSize to match MappingState interface
      metadata
    });
  }, [onDataLoaded, updateState]);

  const handleLoadingChange = useCallback((loading: boolean) => {
    updateState({ isLoading: loading });
  }, [updateState]);

  const handleSourceColumnClick = useCallback((column: string) => {
    if (state.selectedSourceColumn === column) {
      updateState({ selectedSourceColumn: null });
    } else {
      if (state.selectedTargetColumn) {
        // If target column is already selected, connect them immediately in one update
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
      } else {
        // No target selected yet, just select this source column
        updateState({ selectedSourceColumn: column });
      }
    }
  }, [state.selectedSourceColumn, state.selectedTargetColumn, state.connectionCounter, state.mapping, updateState]);

  const handleTargetColumnClick = useCallback((targetColumn: string) => {
    if (state.selectedTargetColumn === targetColumn) {
      updateState({ selectedTargetColumn: null });
    } else {
      if (state.selectedSourceColumn) {
        // If source column is already selected, connect them immediately in one update
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
      } else {
        // No source selected yet, just select this target column
        updateState({ selectedTargetColumn: targetColumn });
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
    const newColumnOrder: string[] = [];
    newOrder.forEach(([key, _, target]) => {
      newMapping[key] = target;
      newColumnOrder.push(key);
    });
    updateState({ 
      mapping: newMapping,
      columnOrder: newColumnOrder 
    });
    
    // Also call the parent onReorder callback to update the central state
    onReorder?.(newOrder);
  }, [updateState, onReorder]);

  const connectedColumns = (() => {
    // If we have mapping but no columnOrder yet (still loading), don't show anything to prevent jumping
    if (Object.keys(state.mapping).length > 0 && (!state.columnOrder || state.columnOrder.length === 0)) {
      return [];
    }
    
    // If we have a columnOrder, use it to preserve order
    if (state.columnOrder && state.columnOrder.length > 0) {
      return state.columnOrder
        .filter(key => state.mapping[key] && state.mapping[key] !== '')
        .map(key => {
          const sourceColumn = key.split('_')[0];
          const target = state.mapping[key];
          return [key, sourceColumn, target] as [string, string, string];
        });
    }
    
    // Only use Object.entries fallback if we have no columnOrder and no mapping (new session)
    return Object.entries(state.mapping).map(([key, target]) => {
      const sourceColumn = key.split('_')[0];
      return [key, sourceColumn, target] as [string, string, string];
    }).filter(([_, __, target]) => target !== '');
  })();

  const mappedTargetColumns = new Set(Object.values(state.mapping));

  const columnSetItems = [
    {
      value: 'artikelen',
      label: t('columnMapper.artikelen'),
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
      label: t('columnMapper.klanten'),
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
    if (!state.sourceData || !state.sourceFilename) {
      setShowNoFileDialog(true);
      return;
    }

    const transformedData = state.sourceData.map(row => {
      const newRow: Record<string, any> = {};
      state.sourceColumns.forEach(sourceColumn => {
        const targetColumn = state.mapping[sourceColumn] || sourceColumn;
        let value = row[sourceColumn];
        if (state.columnTransforms[sourceColumn]) {
          try {
            const transform = new Function('value', 'row', `return ${state.columnTransforms[sourceColumn]}`);
            value = transform(value, row);
          } catch (error) {
            console.error(`Error transforming column ${sourceColumn}:`, error);
          }
        }
        newRow[targetColumn] = value;
      });
      return newRow;
    });

    onExport(transformedData, state.metadata);
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
          activeFilter={state.activeFilter as CompoundFilter | null}
          onFilterChange={(filter: CompoundFilter | null) => updateState({ activeFilter: filter })}
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
              searchPlaceholder={t('columnMapper.search')}
              columnTransforms={state.columnTransforms}
              sourceData={state.sourceData}
            />
            <ColumnList
              title={
                <div className="flex items-center justify-between">
                  <span>{t('columnMapper.targetColumns')}</span>
                  <PM7Menu
                    items={columnSetItems.map(item => ({
                      label: item.label,
                      icon: item.icon,
                      onClick: () => onColumnSetChange(item.value as 'artikelen' | 'klanten')
                    }))}
                  >
                    {activeColumnSet === 'artikelen' ? t('columnMapper.artikelen') : t('columnMapper.klanten')}
                  </PM7Menu>
                </div>
              }
              columns={targetColumns}
              searchValue={state.targetSearch}
              onSearchChange={(value) => handleSearchChange('target', value)}
              selectedColumn={state.selectedTargetColumn}
              onColumnClick={handleTargetColumnClick}
              isColumnMapped={(column) => mappedTargetColumns.has(column)}
              searchPlaceholder={t('columnMapper.search')}
            />
          </div>
        </VanillaCardContent>
      </VanillaCard>

      <div className="text-xs text-gray-300 ml-[0.4rem] mt-[0.2rem]">
        <VersionDisplay />
      </div>
      <PM7Dialog open={showNoFileDialog} onOpenChange={setShowNoFileDialog}>
        <PM7DialogContent maxWidth="xs" showCloseButton={false}>
          <PM7DialogHeader>
            <PM7DialogIcon>
              <AlertCircle className="h-6 w-6 text-amber-500" />
            </PM7DialogIcon>
            <PM7DialogTitle>{t('fileUpload.noFileSelected')}</PM7DialogTitle>
            <PM7DialogDescription>
              {t('fileUpload.selectFileBeforeExport')}
            </PM7DialogDescription>
          </PM7DialogHeader>
          <PM7DialogFooter>
            <PM7Button 
              variant="primary"
              onClick={() => setShowNoFileDialog(false)}
            >
              {t('common.close')}
            </PM7Button>
          </PM7DialogFooter>
        </PM7DialogContent>
      </PM7Dialog>
      <Toaster />
    </div>
  );
};

export default ColumnMapperContent;