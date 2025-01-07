import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type SharedConfiguration = {
  id: string;
  source_file: string;
  file_name: string;
  settings: {
    mapping: Record<string, string>;
    columnTransforms: Record<string, string>;
  };
  created_at: string;
  last_modified: string;
};