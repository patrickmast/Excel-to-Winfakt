import { useEffect, useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { ColumnMapperProps } from './column-mapper/types';
import { useMappingState } from './column-mapper/useMappingState';
import { useConfiguration } from '@/hooks/use-configuration';
import SavedConfigDialog from './column-mapper/SavedConfigDialog';
import ColumnMapperContent from './column-mapper/ColumnMapperContent';
import { downloadCSV } from '@/utils/csvUtils';
import { MappingState, ConfigurationSettings } from './column-mapper/types';

const ColumnMapper = ({
  targetColumns,
  onMappingChange,
  onExport,
  onDataLoaded,
  activeColumnSet,
  onColumnSetChange,
  onSourceFileChange,
  shouldReset
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

  const handleFileData = useCallback((columns: string[], data: any[], sourceFilename: string, worksheetName?: string, fileSize?: number) => {
    // Update state first
    updateState({
      sourceColumns: columns,
      sourceData: data,
      sourceFilename: sourceFilename,
      selectedSourceColumn: null,
      selectedTargetColumn: null,
      connectionCounter: 0,
      worksheetName
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
    onDataLoaded(data);
  }, [updateState, onSourceFileChange, onDataLoaded]);

  const handleExport = useCallback((filteredData?: any[]) => {
    // Use filtered data if provided, otherwise use all source data
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

    const outputFilename = state.sourceFilename ? state.sourceFilename.replace(/\.[^/.]+$/, '.CSV') : 'converted.CSV';
    downloadCSV(transformedData, outputFilename, state.sourceFilename || undefined, state.worksheetName);
    onExport(state.mapping);
    toast({
      title: "Export successful",
      description: `Your file has been converted and downloaded (${transformedData.length} rows)`,
    });
  }, [state.sourceData, state.mapping, state.columnTransforms, state.sourceFilename, state.worksheetName, onExport]);

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