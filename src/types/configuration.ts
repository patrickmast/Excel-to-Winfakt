/**
 * Types for the new configuration system based on dossier numbers
 */

import type { Json } from '@/integrations/supabase/types';

export interface SavedConfiguration {
  id: string;
  dossier_number: string;
  configuration_name: string;
  configuration_data: Json;
  created_at: string;
  updated_at: string;
}

export interface ConfigurationListItem {
  id: string;
  configuration_name: string;
  created_at: string;
  updated_at: string;
}

export interface SaveConfigurationRequest {
  dossier_number: string;
  configuration_name: string;
  configuration_data: Json;
}

export interface LoadConfigurationRequest {
  dossier_number: string;
  configuration_name: string;
}

export interface DeleteConfigurationRequest {
  dossier_number: string;
  configuration_name: string;
}

export interface ListConfigurationsRequest {
  dossier_number: string;
}