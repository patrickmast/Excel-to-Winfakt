import { useEffect, useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { ColumnMapperProps } from './column-mapper/types';
import { useMappingState } from './column-mapper/useMappingState';
import { useConfiguration } from '@/hooks/use-configuration';
import SavedConfigDialog from './column-mapper/SavedConfigDialog';
import ColumnMapperContent from './column-mapper/ColumnMapperContent';
import { downloadCSV } from '@/utils/csvUtils';
import { MappingState } from './column-mapper/types';

const ColumnMapper = ({
  targetColumns,
  onMappingChange,
  onExport,
  onDataLoaded,
  activeColumnSet,
  onColumnSetChange
}: ColumnMapperProps) => {
  const [state, updateState] = useMappingState(onMappingChange);
  const { saveConfiguration, isSaving } = useConfiguration();
  const [showSavedDialog, setShowSavedDialog] = useState(false);
  const [savedConfigUrl, setSavedConfigUrl] = useState('');

  useEffect(() => {
    updateState({
      mapping: {},
      columnTransforms: {}
    });
  }, [activeColumnSet]);

  const handleFileData = useCallback((columns: string[], data: any[], sourceFilename: string) => {
    updateState({
      sourceColumns: columns,
      sourceData: data,
      sourceFilename: sourceFilename,
      mapping: {},
      columnTransforms: {},
      selectedSourceColumn: null,
      selectedTargetColumn: null,
      sourceSearch: '',
      targetSearch: '',
      connectionCounter: 0
    });
    onDataLoaded(data);
  }, [onDataLoaded]);

  const handleExport = useCallback(() => {
    const transformedData = state.sourceData.map(row => {
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
    downloadCSV(transformedData, outputFilename);
    onExport(state.mapping);
    toast({
      title: "Export successful",
      description: "Your file has been converted and downloaded",
    });
  }, [state.sourceData, state.mapping, state.columnTransforms, state.sourceFilename, onExport]);

  const handleSaveConfiguration = useCallback(async () => {
    const result = await saveConfiguration(
      state.mapping,
      state.columnTransforms
    );

    if (result) {
      const configUrl = `${window.location.origin}/preview/${result.id}`;
      setSavedConfigUrl(configUrl);
      setShowSavedDialog(true);
    }
  }, [state.mapping, state.columnTransforms, saveConfiguration]);

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