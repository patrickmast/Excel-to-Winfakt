export interface ColumnMapperProps {
  targetColumns: string[];
  onMappingChange: (mapping: Record<string, string>) => void;
  onExport: (mapping: Record<string, string>) => void;
  onDataLoaded: (data: any[]) => void;
  activeColumnSet: 'artikelen' | 'klanten';
  onColumnSetChange: (value: 'artikelen' | 'klanten') => void;
  onSourceFileChange?: (info: { 
    filename: string; 
    rowCount: number; 
    worksheetName?: string;
    size?: number;
  }) => void;
  filename: string;
  rowCount: number;
  worksheetName?: string;
  shouldReset?: boolean;
}

import { CompoundFilter } from './FilterDialog';

export interface MappingState {
  sourceColumns: string[];
  sourceData: any[];
  sourceFilename?: string;
  mapping: Record<string, string>;
  columnTransforms: Record<string, string>;
  selectedSourceColumn: string | null;
  selectedTargetColumn: string | null;
  sourceSearch: string;
  targetSearch: string;
  connectionCounter: number;
  isLoading?: boolean;
  activeFilter: CompoundFilter | null;
}

export interface ConfigurationSettings {
  mapping: Record<string, string>;
  columnTransforms?: Record<string, string>;
  sourceColumns?: string[];
  sourceData?: any[];
  connectionCounter?: number;
  sourceFilename?: string;
  worksheetName?: string;
  activeFilter?: CompoundFilter | null;
}