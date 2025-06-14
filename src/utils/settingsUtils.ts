import { MappingState } from '@/components/column-mapper/types';
import { CompoundFilter } from '@/components/column-mapper/FilterDialog';

export interface Settings {
  mapping: Record<string, string>;
  columnTransforms: Record<string, any>;
  sourceColumns: string[];
  connectionCounter: number;
  sourceSearch: string;
  targetSearch: string;
  sourceFilename?: string;
  worksheetName?: string;
  columnOrder?: string[];
  activeFilter: CompoundFilter | null;
}

export const buildSettings = (state: MappingState): Settings => ({
  mapping: state.mapping,
  columnTransforms: state.columnTransforms,
  sourceColumns: state.sourceColumns,
  connectionCounter: state.connectionCounter,
  sourceSearch: state.sourceSearch,
  targetSearch: state.targetSearch,
  sourceFilename: state.sourceFilename,
  worksheetName: state.worksheetName,
  columnOrder: state.columnOrder,
  activeFilter: state.activeFilter ?? null
});

export const downloadSettingsAsJSON = (state: MappingState, filename?: string) => {
  const settings = buildSettings(state);
  
  const jsonString = JSON.stringify(settings, null, 2);
  
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  
  const defaultFilename = state.sourceFilename 
    ? `${state.sourceFilename.replace(/\.[^/.]+$/, '')}_settings.json`
    : 'excel_to_winfakt_settings.json';
  
  link.download = filename || defaultFilename;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export const validateSettings = (data: any): data is Settings => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const requiredFields = ['mapping', 'columnTransforms', 'sourceColumns'];
  
  for (const field of requiredFields) {
    if (!(field in data)) {
      return false;
    }
  }

  if (typeof data.mapping !== 'object' || Array.isArray(data.mapping)) {
    return false;
  }

  if (typeof data.columnTransforms !== 'object' || Array.isArray(data.columnTransforms)) {
    return false;
  }

  if (!Array.isArray(data.sourceColumns)) {
    return false;
  }

  return true;
};

export const loadSettingsFromJSON = (file: File): Promise<Settings> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      reject(new Error('File must be a JSON file'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        
        if (!validateSettings(data)) {
          reject(new Error('Invalid settings file format'));
          return;
        }
        
        resolve(data as Settings);
      } catch (error) {
        reject(new Error('Failed to parse JSON file: ' + (error as Error).message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};
