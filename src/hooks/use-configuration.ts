import { supabase } from '@/integrations/supabase/client';

export const useConfiguration = () => {
  const saveConfiguration = async (file: File, fileName: string, mapping: Record<string, string>, columnTransforms: Record<string, string>) => {
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

    return data;
  };

  const isSaving = false; // Placeholder for saving state

  return { saveConfiguration, isSaving };
};
