import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';
import { MappingState } from '@/components/column-mapper/types';
import { buildSettings } from '@/utils/settingsUtils';

const STORAGE_KEY = 'configuration';

export const useConfiguration = () => {
  const [isSaving, setIsSaving] = useState(false);

  const saveConfiguration = async (
    state: MappingState,
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
      const settings = buildSettings(state);

      const { data, error } = await supabase
        .from('shared_configurations')
        .insert([{ settings }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Also save to local storage
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings }));

      toast({
        title: "Success",
        description: "Configuration saved successfully",
      });

      return data?.id;
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const loadConfiguration = async (id: number) => {
    const { data: config, error } = await supabase
      .from('shared_configurations')
      .select('*')
      .eq('id', id)
      .single();

    if (config) {
      return config.settings;
    }

    return null;
  };

  return { saveConfiguration, loadConfiguration, isSaving };
};