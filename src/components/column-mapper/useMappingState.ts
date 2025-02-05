import { useState, useEffect, useRef } from 'react';
import { MappingState } from './types';
import { CompoundFilter } from './FilterDialog';
import { Settings, buildSettings } from '@/utils/settingsUtils';

const STORAGE_KEY = 'csv-transformer-state';

type PersistedState = {
  settings: Settings;
};

const getStoredState = (): PersistedState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    // Handle legacy format and remove sourceData if present
    if (data.settings?.sourceData) {
      delete data.settings.sourceData;
    }
    return data.settings ? data : {
      settings: buildSettings(data)
    };
  } catch {
    return null;
  }
};

const storeState = (state: MappingState) => {
  const settings = buildSettings(state);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings }));
};

export const useMappingState = (onMappingChange: (mapping: Record<string, string>) => void) => {
  const [state, setState] = useState<MappingState>(() => {
    const storedState = getStoredState();
    return {
      mapping: storedState?.settings?.mapping ?? {},
      columnTransforms: storedState?.settings?.columnTransforms ?? {},
      sourceSearch: storedState?.settings?.sourceSearch ?? '',
      targetSearch: storedState?.settings?.targetSearch ?? '',
      activeFilter: storedState?.settings?.activeFilter ?? null,
      selectedSourceColumn: null,
      selectedTargetColumn: null,
      connectionCounter: storedState?.settings?.connectionCounter ?? 0,
      sourceColumns: storedState?.settings?.sourceColumns ?? [],
      sourceData: [],
      isLoading: false
    };
  });

  const prevMappingRef = useRef(state.mapping);

  // Add effect to detect when mapping is cleared externally
  useEffect(() => {
    if (Object.keys(state.mapping).length === 0 && state.sourceColumns.length === 0) {
      // Clear local storage when state is reset
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    }
  }, [state.mapping, state.sourceColumns]);

  useEffect(() => {
    // Only call onMappingChange if the mapping has actually changed
    if (JSON.stringify(prevMappingRef.current) !== JSON.stringify(state.mapping)) {
      prevMappingRef.current = state.mapping;
      onMappingChange(state.mapping);
    }
  }, [state.mapping, onMappingChange]);

  useEffect(() => {
    // Only persist if we have actual state to persist
    if (Object.keys(state.mapping).length > 0 || state.sourceColumns.length > 0) {
      storeState(state);
    }
  }, [state.mapping, state.columnTransforms, state.sourceColumns, state.connectionCounter, state.sourceSearch, state.targetSearch, state.activeFilter]);

  const updateState = (updates: Partial<MappingState>) => {
    setState(prevState => {
      return { ...prevState, ...updates };
    });
  };

  return [state, updateState] as const;
};