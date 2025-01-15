export interface ColumnMapperProps {
  targetColumns: string[];
  onMappingChange: (mapping: Record<string, string>) => void;
  onExport: (mapping: Record<string, string>) => void;
  onDataLoaded: (data: any[]) => void;
  activeColumnSet: 'artikelen' | 'klanten';
  onColumnSetChange: (value: 'artikelen' | 'klanten') => void;
}

export interface MappingState {
  mapping: Record<string, string>;
  columnTransforms: Record<string, string>;
  sourceSearch: string;
  targetSearch: string;
  selectedSourceColumn: string | null;
  selectedTargetColumn: string | null;
  connectionCounter: number;
  sourceColumns: string[];
  sourceData: any[];
  isLoading: boolean;
}

export interface ConfigurationSettings {
  mapping: Record<string, string>;
  columnTransforms?: Record<string, string>;
}