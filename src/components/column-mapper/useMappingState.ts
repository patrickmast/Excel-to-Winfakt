import { useState, useEffect } from 'react';
import { MappingState } from './types';

export const useMappingState = (onMappingChange: (mapping: Record<string, string>) => void) => {
  const [state, setState] = useState<MappingState>({
    mapping: {},
    columnTransforms: {},
    sourceSearch: '',
    targetSearch: '',
    selectedSourceColumn: null,
    selectedTargetColumn: null,
    connectionCounter: 0,
    sourceColumns: [],
    sourceData: []
  });

  useEffect(() => {
    onMappingChange(state.mapping);
  }, [state.mapping, onMappingChange]);

  const updateState = (updates: Partial<MappingState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  return [state, updateState] as const;
};