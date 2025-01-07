import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

export const useConfiguration = () => {
  const [isSaving, setIsSaving] = useState(false);

  const saveConfiguration = async (
    file: File, 
    fileName: string, 
    mapping: Record<string, string>, 
    columnTransforms: Record<string, string>
  ) => {
    setIsSaving(true);
    
    try {
      const { data, error } = await supabase
        .from('app_logs')
        .insert([
          {
            description: `Configuration saved for file: ${fileName}`,
            log: {
              mapping,
              columnTransforms,
            },
          },
        ]);

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Success",
        description: "Configuration saved successfully",
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