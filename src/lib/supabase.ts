import { createClient } from '@supabase/supabase-js';

// Check if environment variables are defined
if (!import.meta.env.VITE_SUPABASE_URL) {
  throw new Error('VITE_SUPABASE_URL is not defined. Please connect to Supabase through the Lovable interface.');
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('VITE_SUPABASE_ANON_KEY is not defined. Please connect to Supabase through the Lovable interface.');
}

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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