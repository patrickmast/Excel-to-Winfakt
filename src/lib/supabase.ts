import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://ujebouvijitxqazlvnfm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZWJvdXZpaml0eHFhemx2bmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwOTA3NDAsImV4cCI6MjA0OTY2Njc0MH0.lBfslcWthy3nsncxd6H_B9j_JctzWxDZyStNqsXmK7M'
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