export interface ColumnMapperProps {
  targetColumns: string[];
  onMappingChange: (mapping: Record<string, string>) => void;
  onExport: (mapping: Record<string, string>) => void;
  onDataLoaded: (data: any[]) => void;
  activeColumnSet: 'artikelen' | 'klanten';
  onColumnSetChange: (value: 'artikelen' | 'klanten') => void;
}

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
  isLoading: boolean;
}

export interface ConfigurationSettings {
  mapping: Record<string, string>;
  columnTransforms: Record<string, string>;
}

export interface ColumnMapperContentProps {
  state: MappingState;
  updateState: (updates: Partial<MappingState>) => void;
  targetColumns: string[];
  activeColumnSet: 'artikelen' | 'klanten';
  onColumnSetChange: (value: 'artikelen' | 'klanten') => void;
  onDataLoaded: (columns: string[], data: any[], sourceFilename: string) => void;
  onExport: () => void;
}

export interface ConnectedColumnsProps {
  connectedColumns: [string, string, string][];
  onDisconnect?: (source: string) => void;
  onExport?: () => void;
  onUpdateTransform?: (uniqueKey: string, code: string) => void;
  columnTransforms?: Record<string, string>;
  sourceColumns: string[];
  sourceData?: any[];
  activeColumnSet: 'artikelen' | 'klanten';
  currentMapping: Record<string, string>;
  onColumnSetChange: (value: 'artikelen' | 'klanten') => void;
}

export interface ColumnListProps {
  title: string;
  columns: string[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedColumn: string | null;
  onColumnClick: (column: string) => void;
  isColumnMapped: (column: string) => boolean;
  searchPlaceholder: string;
}