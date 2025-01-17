import React from 'react';
import ConnectedColumns from './ConnectedColumns';
import ColumnList from './ColumnList';
import { Header } from './Header';
import { ColumnMapperContentProps } from './types';
import VersionDisplay from '../VersionDisplay';

const ColumnMapperContent: React.FC<ColumnMapperContentProps> = ({
  state,
  updateState,
  targetColumns,
  activeColumnSet,
  onColumnSetChange,
  onDataLoaded,
  onExport
}) => {
  const handleFileSelect = (file: File) => {
    // Handle file selection if needed
    console.log('File selected:', file);
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        activeColumnSet={activeColumnSet}
        onColumnSetChange={onColumnSetChange}
        onDataLoaded={onDataLoaded}
        currentMapping={state.mapping}
        isLoading={state.isLoading}
        onLoadingChange={(loading) => updateState({ isLoading: loading })}
        onFileSelect={handleFileSelect}
      />
      <ConnectedColumns
        connectedColumns={Object.entries(state.mapping).map(([uniqueKey, target]) => [uniqueKey, uniqueKey.split('_')[0], target])}
        sourceColumns={state.sourceColumns}
        sourceData={state.sourceData}
        columnTransforms={state.columnTransforms}
        onUpdateTransform={(uniqueKey, code) => 
          updateState({ 
            columnTransforms: { ...state.columnTransforms, [uniqueKey]: code } 
          })
        }
        onDisconnect={(uniqueKey) => {
          const newMapping = { ...state.mapping };
          delete newMapping[uniqueKey];
          updateState({ mapping: newMapping });
        }}
        activeColumnSet={activeColumnSet}
        currentMapping={state.mapping}
        onColumnSetChange={onColumnSetChange}
        onExport={onExport}
      />
      <ColumnList
        title="Connected Columns"
        columns={state.sourceColumns}
        searchValue={state.sourceSearch}
        onSearchChange={(value) => updateState({ sourceSearch: value })}
        selectedColumn={state.selectedSourceColumn}
        onColumnClick={(column) => updateState({ selectedSourceColumn: column })}
        isColumnMapped={(column) => Object.keys(state.mapping).includes(column)}
        searchPlaceholder="Search columns..."
        currentMapping={state.mapping}
        onColumnSetChange={onColumnSetChange}
        isLoading={state.isLoading}
      />
      <VersionDisplay />
    </div>
  );
};

export default ColumnMapperContent;