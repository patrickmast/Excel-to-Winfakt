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
  activeFilter: state.activeFilter ?? null
});
