import { useState, useEffect, useRef } from 'react';
import { MappingState } from './types';

const STORAGE_KEY = 'csv-transformer-state';

type PersistedState = Pick<MappingState, 'mapping' | 'columnTransforms' | 'sourceColumns' | 'sourceData' | 'connectionCounter'>;

const getStoredState = (): PersistedState | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading stored state:', error);
    return null;
  }
};

export const useMappingState = (onMappingChange: (mapping: Record<string, string>) => void) => {
  const [state, setState] = useState<MappingState>(() => {
    const storedState = getStoredState();
    return {
      mapping: storedState?.mapping ?? {},
      columnTransforms: storedState?.columnTransforms ?? {},
      sourceSearch: '',
      targetSearch: '',
      selectedSourceColumn: null,
      selectedTargetColumn: null,
      connectionCounter: storedState?.connectionCounter ?? 0,
      sourceColumns: storedState?.sourceColumns ?? [],
      sourceData: storedState?.sourceData ?? [],
      isLoading: false
    };
  });

  const prevMappingRef = useRef(state.mapping);

  useEffect(() => {
    // Only call onMappingChange if the mapping has actually changed
    if (JSON.stringify(prevMappingRef.current) !== JSON.stringify(state.mapping)) {
      prevMappingRef.current = state.mapping;
      onMappingChange(state.mapping);
    }
  }, [state.mapping, onMappingChange]);

  useEffect(() => {
    // Only persist specific parts of the state
    const persistedState: PersistedState = {
      mapping: state.mapping,
      columnTransforms: state.columnTransforms,
      sourceColumns: state.sourceColumns,
      sourceData: state.sourceData,
      connectionCounter: state.connectionCounter
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
    } catch (error) {
      console.error('Error saving state to localStorage:', error);
    }
  }, [state.mapping, state.columnTransforms, state.sourceColumns, state.sourceData, state.connectionCounter]);

  const updateState = (updates: Partial<MappingState>) => {
    setState(prevState => {
      return { ...prevState, ...updates };
    });
  };

  return [state, updateState] as const;
};