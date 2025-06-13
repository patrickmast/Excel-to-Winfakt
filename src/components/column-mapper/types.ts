export interface ColumnMapperProps {
  targetColumns: string[];
  onMappingChange: (mapping: Record<string, string>) => void;
  onExport: (data: any[], metadata?: any) => void;
  onDataLoaded: (
    columns: string[],
    data: any[],
    sourceFilename: string,
    worksheetName?: string,
    fileSize?: number,
    metadata?: any
  ) => void;
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
  onTransformUpdate?: (uniqueKey: string, code: string) => void;
  onFilterUpdate?: (filter: CompoundFilter | null) => void;
  onLoadingChange?: (loading: boolean) => void;
  currentMapping?: Record<string, string>;
  sourceData?: any[];
  sourceColumns?: string[];
  sourceFilename?: string;
  columnTransforms?: Record<string, string>;
  isLoading?: boolean;
  activeFilter?: CompoundFilter | null;
  onReorder?: (newOrder: [string, string, string][]) => void;
  columnOrder?: string[];
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
  metadata?: any;
  worksheetName?: string;
  sourceFileSize?: number; // Added to store the file size
  columnOrder?: string[]; // Added to preserve the order of connected columns
}

export interface ConfigurationSettings {
  mapping: Record<string, string>;
  columnTransforms?: Record<string, string>;
  sourceColumns?: string[];
  sourceData?: any[];
  connectionCounter?: number;
  sourceFilename?: string;
  worksheetName?: string;
  sourceSearch?: string;
  targetSearch?: string;
  activeFilter?: CompoundFilter | null;
  columnOrder?: string[]; // Added to preserve the order of connected columns
}