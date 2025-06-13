import { useEffect, useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { ColumnMapperProps } from './column-mapper/types';
import { useMappingReducer } from '@/hooks/use-mapping-reducer';
import { useConfiguration } from '@/hooks/use-configuration';
import SavedConfigDialog from './column-mapper/SavedConfigDialog';
import ColumnMapperContent from './column-mapper/ColumnMapperContent';
import { MappingState, ConfigurationSettings } from './column-mapper/types';
import { createColumnProxy, createExpressionWrapper } from '@/utils/expressionUtils';

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
  activeFilter,
  onReorder,
  columnOrder
}: ColumnMapperProps) => {
  const {
    state,
    loadConfiguration,
    setMapping,
    setSourceData,
    resetState,
    updateTransforms,
    setFilter,
    setColumnOrder
  } = useMappingReducer();
  const { saveConfiguration, isSaving } = useConfiguration();
  const [showSavedDialog, setShowSavedDialog] = useState(false);
  const [savedConfigUrl, setSavedConfigUrl] = useState('');

  // Reset when shouldReset is true
  useEffect(() => {
    if (shouldReset) {
      resetState();
    }
  }, [shouldReset, resetState]);

  // Sync internal state with props when they change (for loading settings)
  useEffect(() => {
    if (currentMapping && Object.keys(currentMapping).length > 0) {
      setMapping(currentMapping);
    }
    
    if (sourceColumns && sourceData && sourceColumns.length > 0) {
      setSourceData(sourceColumns, sourceData, { filename: sourceFilename, worksheetName });
    }
    
    if (columnTransforms && Object.keys(columnTransforms).length > 0) {
      console.log('Updating columnTransforms from props:', columnTransforms);
      updateTransforms(columnTransforms);
    }
    
    if (activeFilter !== undefined) {
      setFilter(activeFilter);
    }
    
    if (columnOrder && columnOrder.length > 0) {
      setColumnOrder(columnOrder);
    }
  }, [currentMapping, sourceColumns, sourceData, sourceFilename, columnTransforms, activeFilter, worksheetName, isLoading, columnOrder, setMapping, setSourceData, updateTransforms, setFilter, setColumnOrder]);

  const handleFileData = useCallback((columns: string[], data: any[], sourceFilename: string, worksheetName?: string, fileSize?: number, metadata?: any) => {
    // Update state first
    setSourceData(columns, data, { filename: sourceFilename, worksheetName });

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
  }, [setSourceData, onSourceFileChange, onDataLoaded]);


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
            // Create a proxy object that supports different access patterns
            const col = createColumnProxy(row, state.sourceColumns);
            
            // Create wrapper function with expression preprocessing
            const wrapper = createExpressionWrapper(state.columnTransforms[uniqueKey], state.sourceColumns);
            value = wrapper(col, value);
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

  // Create updateState wrapper for ColumnMapperContent compatibility
  const updateState = useCallback((updates: Partial<MappingState>) => {
    if (updates.mapping !== undefined) {
      setMapping(updates.mapping);
      onMappingChange(updates.mapping);
    }
    if (updates.columnTransforms !== undefined) updateTransforms(updates.columnTransforms);
    if (updates.activeFilter !== undefined) setFilter(updates.activeFilter);
    if (updates.columnOrder !== undefined) setColumnOrder(updates.columnOrder);
    if (updates.sourceColumns && updates.sourceData) {
      setSourceData(updates.sourceColumns, updates.sourceData, {
        filename: updates.sourceFilename,
        worksheetName: updates.worksheetName
      });
    }
  }, [setMapping, updateTransforms, setFilter, setColumnOrder, setSourceData, onMappingChange]);

  // Notify parent when mapping changes in the reducer
  useEffect(() => {
    onMappingChange(state.mapping);
  }, [state.mapping, onMappingChange]);

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
        onReorder={onReorder}
      />
    </>
  );
};

export default ColumnMapper;