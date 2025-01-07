import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

export const useConfiguration = () => {
  const [isSaving, setIsSaving] = useState(false);

  const saveConfiguration = async (
    file: File, 
    fileName: string, 
    mapping: Record<string, string>, 
    columnTransforms: Record<string, string>,
    isNewConfig: boolean = true
  ) => {
    setIsSaving(true);
    
    try {
      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      // Convert ArrayBuffer to Uint8Array
      const uint8Array = new Uint8Array(arrayBuffer);
      // Convert Uint8Array to base64 string
      const base64String = btoa(
        uint8Array.reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      const { data, error } = await supabase
        .from('shared_configurations')
        .insert({
          source_file: base64String,
          file_name: fileName,
          settings: {
            mapping,
            columnTransforms,
          },
        })
        .select()
        .maybeSingle();

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