import { useReducer } from 'react';
import { MappingState, ConfigurationSettings } from '@/components/column-mapper/types';
import { CompoundFilter } from '@/components/column-mapper/FilterDialog';

type MappingAction =
  | { type: 'LOAD_CONFIGURATION'; payload: ConfigurationSettings }
  | { type: 'SET_MAPPING'; payload: Record<string, string> }
  | { type: 'SET_SOURCE_DATA'; payload: { columns: string[]; data: any[]; filename?: string; worksheetName?: string } }
  | { type: 'RESET_STATE' }
  | { type: 'UPDATE_TRANSFORMS'; payload: Record<string, string> }
  | { type: 'SET_FILTER'; payload: CompoundFilter | null };

const initialState: MappingState = {
  mapping: {},
  columnTransforms: {},
  sourceSearch: '',
  targetSearch: '',
  selectedSourceColumn: null,
  selectedTargetColumn: null,
  connectionCounter: 0,
  sourceColumns: [],
  sourceData: [], // Keep this for runtime but don't persist
  isLoading: false,
  activeFilter: null
};

const STORAGE_KEY = 'csv-transformer-state';

function mappingReducer(state: MappingState, action: MappingAction): MappingState {
  switch (action.type) {
    case 'LOAD_CONFIGURATION':
      return {
        ...state,
        mapping: action.payload.mapping || {},
        columnTransforms: action.payload.columnTransforms || {},
        sourceColumns: action.payload.sourceColumns || [],
        connectionCounter: action.payload.connectionCounter || 0,
        sourceFilename: action.payload.sourceFilename,
        selectedSourceColumn: null,
        selectedTargetColumn: null,
        sourceSearch: action.payload.sourceSearch || '',
        targetSearch: action.payload.targetSearch || '',
        activeFilter: action.payload.activeFilter || null,
        isLoading: false,
        sourceData: [] // Reset source data when loading config
      };

    case 'SET_MAPPING':
      return {
        ...state,
        mapping: action.payload
      };

    case 'SET_SOURCE_DATA':
      return {
        ...state,
        sourceColumns: action.payload.columns,
        sourceData: action.payload.data,
        sourceFilename: action.payload.filename,
        worksheetName: action.payload.worksheetName
      };

    case 'RESET_STATE':
      return {
        ...initialState,
        isLoading: false
      };

    case 'UPDATE_TRANSFORMS':
      return {
        ...state,
        columnTransforms: action.payload
      };

    case 'SET_FILTER':
      return {
        ...state,
        activeFilter: action.payload
      };

    default:
      return state;
  }
}

export function useMappingReducer() {
  const [state, dispatch] = useReducer(mappingReducer, initialState);

  const loadConfiguration = (config: ConfigurationSettings) => {
    dispatch({ type: 'LOAD_CONFIGURATION', payload: config });
  };

  const setMapping = (mapping: Record<string, string>) => {
    dispatch({ type: 'SET_MAPPING', payload: mapping });
  };

  const setSourceData = (columns: string[], data: any[], fileInfo: { filename?: string; worksheetName?: string } = {}) => {
    dispatch({ type: 'SET_SOURCE_DATA', payload: { columns, data, ...fileInfo } });
  };

  const resetState = () => {
    dispatch({ type: 'RESET_STATE' });
  };

  const updateTransforms = (transforms: Record<string, string>) => {
    dispatch({ type: 'UPDATE_TRANSFORMS', payload: transforms });
  };

  const setFilter = (filter: CompoundFilter | null) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  return {
    state,
    loadConfiguration,
    setMapping,
    setSourceData,
    resetState,
    updateTransforms,
    setFilter
  };
}