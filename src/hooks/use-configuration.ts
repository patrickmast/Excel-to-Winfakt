import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';
import { MappingState } from '@/components/column-mapper/types';

type SaveableState = Pick<MappingState, 'mapping' | 'columnTransforms' | 'sourceColumns' | 'connectionCounter' | 'sourceFilename'>;

export const useConfiguration = () => {
  const [isSaving, setIsSaving] = useState(false);

  const saveConfiguration = async (
    state: SaveableState,
    isNewConfig: boolean = true
  ) => {
    // Return early if no mapping exists
    if (!state.mapping || Object.keys(state.mapping).length === 0) {
      toast({
        title: "Error",
        description: "No mapping configuration to save",
        variant: "destructive",
      });
      return null;
    }

    setIsSaving(true);

    try {
      const { data, error } = await supabase
        .from('shared_configurations')
        .insert({
          settings: {
            mapping: state.mapping,
            columnTransforms: state.columnTransforms,
            sourceColumns: state.sourceColumns,
            connectionCounter: state.connectionCounter,
            sourceFilename: state.sourceFilename
          },
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Success",
        description: `Configuration ${isNewConfig ? 'saved' : 'updated'} successfully`,
      });

      return data;
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save configuration",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return { saveConfiguration, isSaving };
};