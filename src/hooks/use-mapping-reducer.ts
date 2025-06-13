import { useReducer } from 'react';
import { MappingState, ConfigurationSettings } from '@/components/column-mapper/types';
import { CompoundFilter } from '@/components/column-mapper/FilterDialog';

type MappingAction =
  | { type: 'LOAD_CONFIGURATION'; payload: ConfigurationSettings }
  | { type: 'SET_MAPPING'; payload: Record<string, string> }
  | { type: 'SET_SOURCE_DATA'; payload: { columns: string[]; data: any[]; filename?: string; worksheetName?: string } }
  | { type: 'RESET_STATE' }
  | { type: 'UPDATE_TRANSFORMS'; payload: Record<string, string> }
  | { type: 'SET_FILTER'; payload: CompoundFilter | null }
  | { type: 'SET_COLUMN_ORDER'; payload: string[] };

const getInitialState = (): MappingState => {
  const stored = getStoredState();
  
  return {
    mapping: stored?.settings?.mapping || {},
    columnTransforms: stored?.settings?.columnTransforms || {},
    sourceSearch: stored?.settings?.sourceSearch || '',
    targetSearch: stored?.settings?.targetSearch || '',
    selectedSourceColumn: null,
    selectedTargetColumn: null,
    connectionCounter: stored?.settings?.connectionCounter || 0,
    sourceColumns: stored?.settings?.sourceColumns || [],
    sourceData: [], // Keep this for runtime but don't persist
    isLoading: false,
    activeFilter: stored?.settings?.activeFilter || null,
    columnOrder: stored?.settings?.columnOrder || [],
    sourceFilename: stored?.settings?.sourceFilename,
    worksheetName: stored?.settings?.worksheetName
  };
};

const STORAGE_KEY = 'csv-transformer-state';

// Helper functions for localStorage - moved before getInitialState
const getStoredState = (): any => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const storeState = (state: MappingState) => {
  try {
    const settings = {
      mapping: state.mapping,
      columnTransforms: state.columnTransforms,
      sourceColumns: state.sourceColumns,
      connectionCounter: state.connectionCounter,
      sourceSearch: state.sourceSearch,
      targetSearch: state.targetSearch,
      sourceFilename: state.sourceFilename,
      worksheetName: state.worksheetName,
      columnOrder: state.columnOrder,
      activeFilter: state.activeFilter
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings }));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

function mappingReducer(state: MappingState, action: MappingAction): MappingState {
  let newState: MappingState;
  
  switch (action.type) {
    case 'LOAD_CONFIGURATION':
      newState = {
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
        columnOrder: action.payload.columnOrder || [],
        isLoading: false,
        sourceData: [] // Reset source data when loading config
      };
      break;

    case 'SET_MAPPING':
      newState = {
        ...state,
        mapping: action.payload
      };
      break;

    case 'SET_SOURCE_DATA':
      newState = {
        ...state,
        sourceColumns: action.payload.columns,
        sourceData: action.payload.data,
        sourceFilename: action.payload.filename,
        worksheetName: action.payload.worksheetName
      };
      break;

    case 'RESET_STATE':
      newState = {
        ...getInitialState(),
        sourceColumns: [],
        sourceData: [],
        mapping: {},
        columnTransforms: {},
        isLoading: false
      };
      // Clear localStorage on reset
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
      return newState;

    case 'UPDATE_TRANSFORMS':
      newState = {
        ...state,
        columnTransforms: action.payload
      };
      break;

    case 'SET_FILTER':
      newState = {
        ...state,
        activeFilter: action.payload
      };
      break;

    case 'SET_COLUMN_ORDER':
      newState = {
        ...state,
        columnOrder: action.payload
      };
      break;

    default:
      return state;
  }
  
  // Auto-save to localStorage after every state change (except RESET)
  storeState(newState);
  return newState;
}

export function useMappingReducer() {
  const [state, dispatch] = useReducer(mappingReducer, undefined, getInitialState);

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

  const setColumnOrder = (columnOrder: string[]) => {
    dispatch({ type: 'SET_COLUMN_ORDER', payload: columnOrder });
  };

  return {
    state,
    loadConfiguration,
    setMapping,
    setSourceData,
    resetState,
    updateTransforms,
    setFilter,
    setColumnOrder
  };
}