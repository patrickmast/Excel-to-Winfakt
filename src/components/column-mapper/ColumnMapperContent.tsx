import React from 'react';
import ConnectedColumns from './ConnectedColumns';
import ColumnList from './ColumnList';
import { Header } from './Header';
import { MappingState } from './types';
import VersionDisplay from '../VersionDisplay';

interface ColumnMapperContentProps {
  activeColumnSet: string;
  onColumnSetChange: (columnSet: string) => void;
  onDataLoaded: (columns: string[], data: any[], sourceFilename: string) => void;
  currentMapping: Record<string, string>;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
}

const ColumnMapperContent: React.FC<ColumnMapperContentProps> = ({
  activeColumnSet,
  onColumnSetChange,
  onDataLoaded,
  currentMapping,
  isLoading,
  onLoadingChange,
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
        currentMapping={currentMapping}
        isLoading={isLoading}
        onLoadingChange={onLoadingChange}
        onFileSelect={handleFileSelect}
      />
      <ConnectedColumns
        activeColumnSet={activeColumnSet}
        currentMapping={currentMapping}
        onColumnSetChange={onColumnSetChange}
        onDataLoaded={onDataLoaded}
        isLoading={isLoading}
        onLoadingChange={onLoadingChange}
      />
      <ColumnList
        currentMapping={currentMapping}
        onColumnSetChange={onColumnSetChange}
        isLoading={isLoading}
      />
      <VersionDisplay />
    </div>
  );
};

export default ColumnMapperContent;
