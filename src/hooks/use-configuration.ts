import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import type { SharedConfiguration } from '@/lib/supabase';

export const useConfiguration = () => {
  const [isSaving, setIsSaving] = useState(false);

  const saveConfiguration = async (
    sourceFile: File | null,
    fileName: string,
    mapping: Record<string, string>,
    columnTransforms: Record<string, string>
  ) => {
    if (!sourceFile) {
      toast({
        title: "Error",
        description: "No file selected to save",
        variant: "destructive",
      });
      return null;
    }

    setIsSaving(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      const fileContent = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(sourceFile);
      });

      const { data, error } = await supabase
        .from('shared_configurations')
        .insert({
          source_file: fileContent,
          file_name: fileName,
          settings: {
            mapping,
            columnTransforms,
          },
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Configuration saved successfully",
      });

      return data as SharedConfiguration;
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

  return {
    saveConfiguration,
    isSaving,
  };
};