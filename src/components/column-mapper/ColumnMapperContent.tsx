import { useCallback, useState } from 'react';
import { VanillaCard, VanillaCardContent } from '../vanilla/react/VanillaCard';
import '@/components/vanilla/Card.css';
import ConnectedColumns from './ConnectedColumns';
import ColumnList from './ColumnList';
import Header from './Header';
import { MappingState } from './types';
import { CompoundFilter } from './FilterDialog';
import VersionDisplay from '../VersionDisplay';
import { VanillaMenu } from '../vanilla/react/VanillaMenu';
import '@/components/vanilla/Menu.css';
import { downloadCSV, addTimestampToFilename } from '@/utils/csvUtils';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Toaster } from '../../components/ui/toaster';
import { useTranslation } from 'react-i18next';

interface ColumnMapperContentProps {
  state: MappingState;
  updateState: (updates: Partial<MappingState>) => void;
  targetColumns: string[];
  activeColumnSet: string;
  onColumnSetChange: (columnSet: string) => void;
  onDataLoaded: (columns: string[], data: any[], sourceFilename: string, worksheetName?: string, fileSize?: number, metadata?: any) => void;
  onExport: (data: any[], metadata?: any) => void;
}

// Using MappingState from types.ts instead of local declaration

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
                  <VanillaMenu
                    items={columnSetItems.map(item => ({
                      label: item.label,
                      icon: item.icon,
                      onClick: () => onColumnSetChange(item.value as 'artikelen' | 'klanten')
                    }))}
                  >
                    {activeColumnSet === 'artikelen' ? t('columnMapper.artikelen') : t('columnMapper.klanten')}
                  </VanillaMenu>
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
      <Dialog open={showNoFileDialog} onOpenChange={setShowNoFileDialog}>
        <DialogContent className="p-0 overflow-hidden border-0">
          <div className="bg-slate-700 p-5 rounded-t-lg">
            <DialogTitle className="text-white m-0">{t('fileUpload.noFileSelected')}</DialogTitle>
          </div>
          <div className="py-10 px-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <DialogDescription className="text-slate-600 m-0">
                {t('fileUpload.selectFileBeforeExport')}
              </DialogDescription>
            </div>
          </div>
          <DialogFooter className="p-5 bg-gray-50">
            <Button 
              className="bg-[#3b82f6] hover:bg-[#2563eb] text-white border-0 
                        shadow-none rounded-md px-6"
              onClick={() => setShowNoFileDialog(false)}
            >
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
};

export default ColumnMapperContent;