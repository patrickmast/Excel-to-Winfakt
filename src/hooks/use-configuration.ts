import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

export const useConfiguration = () => {
  const [isSaving, setIsSaving] = useState(false);

  const saveConfiguration = async (
    mapping: Record<string, string>, 
    columnTransforms: Record<string, string>,
    isNewConfig: boolean = true
  ) => {
    setIsSaving(true);
    
    try {
      const { data, error } = await supabase
        .from('shared_configurations')
        .insert({
          settings: {
            mapping,
            columnTransforms,
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