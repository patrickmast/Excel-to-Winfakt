import { useEffect, useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { ColumnMapperProps } from './column-mapper/types';
import { useMappingState } from './column-mapper/useMappingState';
import { useConfiguration } from '@/hooks/use-configuration';
import SavedConfigDialog from './column-mapper/SavedConfigDialog';
import ColumnMapperContent from './column-mapper/ColumnMapperContent';
import { MappingState, ConfigurationSettings } from './column-mapper/types';

const ColumnMapper = ({
  targetColumns,
  onMappingChange,
  onExport,
  onDataLoaded,
  activeColumnSet,
  onColumnSetChange,
  onSourceFileChange,
  shouldReset,
  onTransformUpdate,
  onFilterUpdate,
  onLoadingChange,
  currentMapping,
  sourceData,
  sourceColumns,
  sourceFilename,
  worksheetName,
  columnTransforms,
  isLoading,
  activeFilter
}: ColumnMapperProps) => {
  const [state, updateState] = useMappingState(onMappingChange);
  const { saveConfiguration, isSaving } = useConfiguration();
  const [showSavedDialog, setShowSavedDialog] = useState(false);
  const [savedConfigUrl, setSavedConfigUrl] = useState('');

  // Reset when shouldReset is true
  useEffect(() => {
    if (shouldReset) {
      updateState({
        mapping: {},
        columnTransforms: {},
        sourceColumns: [],
        sourceData: [],
        sourceFilename: '',
        sourceSearch: '',
        targetSearch: '',
        selectedSourceColumn: null,
        selectedTargetColumn: null,
        connectionCounter: 0,
        isLoading: false
      });
    }
  }, [shouldReset, updateState]);

  // Sync internal state with props when they change (for loading settings)
  useEffect(() => {
    const newState: Partial<MappingState> = {};
    
    if (currentMapping) newState.mapping = currentMapping;
    if (sourceColumns) newState.sourceColumns = sourceColumns;
    if (sourceData) newState.sourceData = sourceData;
    if (sourceFilename) newState.sourceFilename = sourceFilename;
    if (columnTransforms) newState.columnTransforms = columnTransforms;
    if (activeFilter !== undefined) newState.activeFilter = activeFilter;
    if (worksheetName) newState.worksheetName = worksheetName;
    if (isLoading !== undefined) newState.isLoading = isLoading;
    
    if (Object.keys(newState).length > 0) {
      updateState(newState);
    }
  }, [currentMapping, sourceColumns, sourceData, sourceFilename, columnTransforms, activeFilter, worksheetName, isLoading, updateState]);

  const handleFileData = useCallback((columns: string[], data: any[], sourceFilename: string, worksheetName?: string, fileSize?: number, metadata?: any) => {
    // Update state first
    updateState({
      sourceColumns: columns,
      sourceData: data,
      sourceFilename: sourceFilename,
      selectedSourceColumn: null,
      selectedTargetColumn: null,
      connectionCounter: 0,
      worksheetName,
      metadata
    });

    // Notify parent about source file change
    if (onSourceFileChange) {
      onSourceFileChange({
        filename: sourceFilename,
        rowCount: data.length,
        worksheetName,
        size: fileSize
      });
    }

    // Notify parent about data load
    onDataLoaded(columns, data, sourceFilename, worksheetName, fileSize, metadata);
  }, [updateState, onSourceFileChange, onDataLoaded]);

  const handleExport = useCallback((filteredData?: any[]) => {
    if (!state.sourceData || !state.sourceFilename) {
      return;
    }

    const dataToTransform = filteredData || state.sourceData;

    const transformedData = dataToTransform.map(row => {
      const newRow: Record<string, any> = {};
      Object.entries(state.mapping).forEach(([uniqueKey, target]) => {
        const sourceColumn = uniqueKey.split('_')[0];
        let value = row[sourceColumn];

        if (state.columnTransforms[uniqueKey]) {
          try {
            const transform = new Function('value', 'row', `return ${state.columnTransforms[uniqueKey]}`);
            value = transform(value, row);
          } catch (error) {
            console.error(`Error transforming column ${sourceColumn}:`, error);
          }
        }

        newRow[target] = value;
      });
      return newRow;
    });

    // Preserve metadata in the transformed data array
    Object.assign(transformedData, {
      metadata: state.metadata
    });

    // Pass along metadata if it exists
    onExport(transformedData, state.metadata);
  }, [state.sourceData, state.mapping, state.columnTransforms, state.metadata, onExport]);

  const handleSaveConfiguration = useCallback(async () => {
    const configToSave: MappingState = {
      ...state,
      selectedSourceColumn: state.selectedSourceColumn || null,
      selectedTargetColumn: state.selectedTargetColumn || null,
      sourceSearch: state.sourceSearch || '',
      targetSearch: state.targetSearch || '',
      sourceData: state.sourceData || [],
      isLoading: false
    };

    const result = await saveConfiguration(configToSave);

    if (result !== null) {
      const configUrl = `${window.location.origin}/preview/${result}`;
      setSavedConfigUrl(configUrl);
      setShowSavedDialog(true);
    }
  }, [state, saveConfiguration]);

  return (
    <>
      <SavedConfigDialog
        open={showSavedDialog}
        onOpenChange={setShowSavedDialog}
        configUrl={savedConfigUrl}
      />
      <ColumnMapperContent
        state={state}
        updateState={updateState}
        targetColumns={targetColumns}
        activeColumnSet={activeColumnSet}
        onColumnSetChange={onColumnSetChange}
        onDataLoaded={handleFileData}
        onExport={handleExport}
      />
    </>
  );
};

export default ColumnMapper;