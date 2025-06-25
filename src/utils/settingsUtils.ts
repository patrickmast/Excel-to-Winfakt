import { MappingState } from '@/components/column-mapper/types';
import { CompoundFilter } from '@/components/column-mapper/FilterDialog';
import { safeBlobDownload, safeFileRead } from './blobUtils';

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

export const downloadSettingsAsJSON = async (state: MappingState, filename?: string) => {
  try {
    const settings = buildSettings(state);
    const jsonString = JSON.stringify(settings, null, 2);
    
    const defaultFilename = state.sourceFilename 
      ? `${state.sourceFilename.replace(/\.[^/.]+$/, '')}_settings.json`
      : 'excel_to_winfakt_settings.json';
    
    await safeBlobDownload(jsonString, {
      filename: filename || defaultFilename,
      mimeType: 'application/json'
    });
  } catch (error) {
    throw error;
  }
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

export const loadSettingsFromJSON = async (file: File): Promise<Settings> => {
  if (!file) {
    throw new Error('No file provided');
  }

  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    throw new Error('File must be a JSON file');
  }

  try {
    const content = await safeFileRead<string>(file, 'readAsText');
    const data = JSON.parse(content);
    
    if (!validateSettings(data)) {
      throw new Error('Invalid settings file format');
    }
    
    return data as Settings;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load settings: ${error.message}`);
    }
    throw new Error('Failed to load settings file');
  }
};
