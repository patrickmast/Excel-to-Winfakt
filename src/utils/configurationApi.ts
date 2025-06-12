/**
 * API functions for the new dossier-based configuration system
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  SavedConfiguration,
  ConfigurationListItem,
  SaveConfigurationRequest,
  LoadConfigurationRequest,
  DeleteConfigurationRequest,
  ListConfigurationsRequest
} from '@/types/configuration';

/**
 * Save a configuration to Supabase
 * If configuration with same name exists, it will be overwritten
 */
export async function saveConfiguration(request: SaveConfigurationRequest): Promise<SavedConfiguration> {
  const { dossier_number, configuration_name, configuration_data } = request;

  // First, check if the configuration already exists
  const { data: existingConfig } = await supabase
    .from('saved_configurations')
    .select('id')
    .eq('dossier_number', dossier_number)
    .eq('configuration_name', configuration_name)
    .single();

  let result;
  
  if (existingConfig) {
    // Update existing configuration
    const { data, error } = await supabase
      .from('saved_configurations')
      .update({
        configuration_data,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingConfig.id)
      .select()
      .single();
      
    if (error) {
      throw new Error(`Failed to update configuration: ${error.message}`);
    }
    result = data;
  } else {
    // Insert new configuration
    const { data, error } = await supabase
      .from('saved_configurations')
      .insert({
        dossier_number,
        configuration_name,
        configuration_data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) {
      throw new Error(`Failed to insert configuration: ${error.message}`);
    }
    result = data;
  }

  return result;
}

/**
 * Load a specific configuration from Supabase
 */
export async function loadConfiguration(request: LoadConfigurationRequest): Promise<SavedConfiguration | null> {
  const { dossier_number, configuration_name } = request;

  const { data, error } = await supabase
    .from('saved_configurations')
    .select('*')
    .eq('dossier_number', dossier_number)
    .eq('configuration_name', configuration_name)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned - configuration doesn't exist
      return null;
    }
    throw new Error(`Failed to load configuration: ${error.message}`);
  }

  return data;
}

/**
 * List all configurations for a dossier
 */
export async function listConfigurations(request: ListConfigurationsRequest): Promise<ConfigurationListItem[]> {
  const { dossier_number } = request;

  const { data, error } = await supabase
    .from('saved_configurations')
    .select('id, configuration_name, created_at, updated_at')
    .eq('dossier_number', dossier_number)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list configurations: ${error.message}`);
  }

  return data || [];
}

/**
 * Delete a specific configuration
 */
export async function deleteConfiguration(request: DeleteConfigurationRequest): Promise<void> {
  const { dossier_number, configuration_name } = request;

  const { error } = await supabase
    .from('saved_configurations')
    .delete()
    .eq('dossier_number', dossier_number)
    .eq('configuration_name', configuration_name);

  if (error) {
    throw new Error(`Failed to delete configuration: ${error.message}`);
  }
}

/**
 * Check if a configuration name exists for a dossier
 */
export async function configurationExists(dossier_number: string, configuration_name: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('saved_configurations')
    .select('id')
    .eq('dossier_number', dossier_number)
    .eq('configuration_name', configuration_name)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned - configuration doesn't exist
      return false;
    }
    throw new Error(`Failed to check configuration existence: ${error.message}`);
  }

  return !!data;
}