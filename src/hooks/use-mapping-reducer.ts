import { useReducer } from 'react';
import { MappingState, ConfigurationSettings } from '@/components/column-mapper/types';

type MappingAction =
  | { type: 'LOAD_CONFIGURATION'; payload: ConfigurationSettings }
  | { type: 'SET_MAPPING'; payload: Record<string, string> }
  | { type: 'SET_SOURCE_DATA'; payload: { columns: string[]; data: any[]; filename?: string; worksheetName?: string } }
  | { type: 'RESET_STATE' }
  | { type: 'UPDATE_TRANSFORMS'; payload: Record<string, string> };

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
  isLoading: false
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
        sourceSearch: '',
        targetSearch: '',
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
        selectedSourceColumn: null,
        selectedTargetColumn: null,
        sourceSearch: '',
        targetSearch: ''
      };

    case 'RESET_STATE':
      console.log('Reducer: RESET_STATE action received');
      console.log('Current state:', state);
      console.log('Resetting to initial state:', initialState);
      // Clear local storage
      try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('Local storage cleared');
      } catch (error) {
        console.error('Error clearing local storage:', error);
      }
      return {
        ...initialState
      };

    case 'UPDATE_TRANSFORMS':
      return {
        ...state,
        columnTransforms: action.payload
      };

    default:
      return state;
  }
}

export function useMappingReducer() {
  const [state, dispatch] = useReducer(mappingReducer, initialState);

  return {
    state,
    dispatch,
    // Helper functions to make state updates more semantic
    loadConfiguration: (config: ConfigurationSettings) =>
      dispatch({ type: 'LOAD_CONFIGURATION', payload: config }),
    setMapping: (mapping: Record<string, string>) =>
      dispatch({ type: 'SET_MAPPING', payload: mapping }),
    setSourceData: (columns: string[], data: any[], filename?: string, worksheetName?: string) =>
      dispatch({ type: 'SET_SOURCE_DATA', payload: { columns, data, filename, worksheetName } }),
    resetState: () => {
      console.log('resetState helper called - dispatching RESET_STATE action');
      dispatch({ type: 'RESET_STATE' });
    },
    updateTransforms: (transforms: Record<string, string>) =>
      dispatch({ type: 'UPDATE_TRANSFORMS', payload: transforms })
  };
}