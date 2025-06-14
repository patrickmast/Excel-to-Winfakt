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
  | { type: 'SET_COLUMN_ORDER'; payload: string[] }
  | { type: 'MARK_CONFIGURATION_SAVED' }
  | { type: 'INCREMENT_CONNECTION_COUNTER' };

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
    worksheetName: stored?.settings?.worksheetName,
    lastSavedState: null // No saved state initially
  };
};

const STORAGE_KEY = 'excel-to-winfakt-state';

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

// Helper function to extract the relevant configuration settings from state
const extractConfigurationSettings = (state: MappingState): ConfigurationSettings => ({
  mapping: state.mapping,
  columnTransforms: state.columnTransforms,
  sourceColumns: state.sourceColumns,
  connectionCounter: state.connectionCounter,
  sourceFilename: state.sourceFilename,
  worksheetName: state.worksheetName,
  sourceSearch: state.sourceSearch,
  targetSearch: state.targetSearch,
  columnOrder: state.columnOrder,
  activeFilter: state.activeFilter
});

// Helper function to compare two configuration settings for changes
const hasConfigurationChanged = (current: MappingState, lastSaved: ConfigurationSettings | null): boolean => {
  // If no saved state, only show changes if there's actually some configuration present
  if (!lastSaved) {
    const currentConfig = extractConfigurationSettings(current);
    return (
      Object.keys(currentConfig.mapping).length > 0 ||
      Object.keys(currentConfig.columnTransforms || {}).length > 0 ||
      currentConfig.activeFilter !== null ||
      (currentConfig.columnOrder && currentConfig.columnOrder.length > 0)
    );
  }
  
  const currentConfig = extractConfigurationSettings(current);
  
  return (
    JSON.stringify(currentConfig.mapping) !== JSON.stringify(lastSaved.mapping) ||
    JSON.stringify(currentConfig.columnTransforms) !== JSON.stringify(lastSaved.columnTransforms) ||
    JSON.stringify(currentConfig.activeFilter) !== JSON.stringify(lastSaved.activeFilter) ||
    JSON.stringify(currentConfig.columnOrder) !== JSON.stringify(lastSaved.columnOrder)
  );
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
        sourceData: [], // Reset source data when loading config
        lastSavedState: action.payload // Save the loaded configuration as the last saved state
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
      // Clear localStorage first before creating new state
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
      
      // Create completely fresh state without localStorage
      newState = {
        mapping: {},
        columnTransforms: {},
        sourceSearch: '',
        targetSearch: '',
        selectedSourceColumn: null,
        selectedTargetColumn: null,
        connectionCounter: 0,
        sourceColumns: [],
        sourceData: [],
        isLoading: false,
        activeFilter: null,
        columnOrder: [],
        sourceFilename: undefined,
        worksheetName: undefined,
        lastSavedState: null
      };
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

    case 'MARK_CONFIGURATION_SAVED':
      // Update the last saved state to current configuration
      newState = {
        ...state,
        lastSavedState: extractConfigurationSettings(state)
      };
      break;

    case 'INCREMENT_CONNECTION_COUNTER':
      newState = {
        ...state,
        connectionCounter: state.connectionCounter + 1
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

  const markConfigurationSaved = () => {
    dispatch({ type: 'MARK_CONFIGURATION_SAVED' });
  };

  const incrementConnectionCounter = () => {
    dispatch({ type: 'INCREMENT_CONNECTION_COUNTER' });
  };

  // Check if current state has unsaved changes
  const hasUnsavedChanges = hasConfigurationChanged(state, state.lastSavedState);

  return {
    state,
    loadConfiguration,
    setMapping,
    setSourceData,
    resetState,
    updateTransforms,
    setFilter,
    setColumnOrder,
    markConfigurationSaved,
    incrementConnectionCounter,
    hasUnsavedChanges
  };
}