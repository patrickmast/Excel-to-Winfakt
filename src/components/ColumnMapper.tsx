import { useEffect, useState, useCallback } from 'react';
import { toast } from 'pm7-ui-style-guide';
import { ColumnMapperProps } from './column-mapper/types';
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
  columnOrder,
  connectionCounter = 0,
  onConnectionCounterUpdate
}: ColumnMapperProps) => {
  const { saveConfiguration, isSaving } = useConfiguration();
  const [showSavedDialog, setShowSavedDialog] = useState(false);
  const [savedConfigUrl, setSavedConfigUrl] = useState('');
  
  // Local UI state
  const [localUIState, setLocalUIState] = useState({
    sourceSearch: '',
    targetSearch: '',
    selectedSourceColumn: null as string | null,
    selectedTargetColumn: null as string | null
  });

  // Create state object from props and local UI state
  const state: MappingState = {
    mapping: currentMapping || {},
    columnTransforms: columnTransforms || {},
    sourceColumns: sourceColumns || [],
    sourceData: sourceData || [],
    sourceSearch: localUIState.sourceSearch,
    targetSearch: localUIState.targetSearch,
    selectedSourceColumn: localUIState.selectedSourceColumn,
    selectedTargetColumn: localUIState.selectedTargetColumn,
    connectionCounter: connectionCounter,
    isLoading: isLoading || false,
    activeFilter: activeFilter || null,
    columnOrder: columnOrder || [],
    sourceFilename: sourceFilename,
    worksheetName: worksheetName,
    lastSavedState: null
  };
  
  // Reset local UI state when shouldReset is true
  useEffect(() => {
    if (shouldReset) {
      setLocalUIState({
        sourceSearch: '',
        targetSearch: '',
        selectedSourceColumn: null,
        selectedTargetColumn: null
      });
    }
  }, [shouldReset]);

  // No longer need to sync state since we're using props directly

  const handleFileData = useCallback((columns: string[], data: any[], sourceFilename: string, worksheetName?: string, fileSize?: number, metadata?: any) => {
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
  }, [onSourceFileChange, onDataLoaded]);


  const handleExport = useCallback((filteredData?: any[]) => {
    if (!state.sourceData || !state.sourceFilename) {
      return;
    }

    const dataToTransform = filteredData || state.sourceData;

    const transformedData = dataToTransform.map(row => {
      const newRow: Record<string, any> = {};
      Object.entries(state.mapping).forEach(([uniqueKey, target]) => {
        // Extract source column by removing the connection counter suffix (_N)
        const lastUnderscoreIndex = uniqueKey.lastIndexOf('_');
        const sourceColumn = uniqueKey.substring(0, lastUnderscoreIndex);
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
    // Handle local UI state updates
    const uiUpdates: Partial<typeof localUIState> = {};
    if (updates.sourceSearch !== undefined) uiUpdates.sourceSearch = updates.sourceSearch;
    if (updates.targetSearch !== undefined) uiUpdates.targetSearch = updates.targetSearch;
    if (updates.selectedSourceColumn !== undefined) uiUpdates.selectedSourceColumn = updates.selectedSourceColumn;
    if (updates.selectedTargetColumn !== undefined) uiUpdates.selectedTargetColumn = updates.selectedTargetColumn;
    
    if (Object.keys(uiUpdates).length > 0) {
      setLocalUIState(prev => ({ ...prev, ...uiUpdates }));
    }
    
    // Notify parent about state changes
    if (updates.mapping !== undefined) {
      onMappingChange(updates.mapping);
    }
    if (updates.connectionCounter !== undefined && onConnectionCounterUpdate) {
      onConnectionCounterUpdate();
    }
    if (updates.columnTransforms !== undefined && onTransformUpdate) {
      // Update all transforms at once
      Object.entries(updates.columnTransforms).forEach(([key, value]) => {
        onTransformUpdate(key, value);
      });
    }
    if (updates.activeFilter !== undefined && onFilterUpdate) {
      onFilterUpdate(updates.activeFilter);
    }
    if (updates.columnOrder !== undefined && onReorder) {
      // Reconstruct the order array from the mapping
      const newOrder = (updates.columnOrder || []).map(key => {
        // Extract source column by removing the connection counter suffix (_N)
        const lastUnderscoreIndex = key.lastIndexOf('_');
        const sourceColumn = key.substring(0, lastUnderscoreIndex);
        const target = updates.mapping?.[key] || state.mapping[key] || '';
        return [key, sourceColumn, target] as [string, string, string];
      });
      onReorder(newOrder);
    }
    if (updates.sourceColumns && updates.sourceData) {
      onDataLoaded(updates.sourceColumns, updates.sourceData, updates.sourceFilename || '', updates.worksheetName);
    }
  }, [onMappingChange, onTransformUpdate, onFilterUpdate, onReorder, onDataLoaded, state.mapping, localUIState]);

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