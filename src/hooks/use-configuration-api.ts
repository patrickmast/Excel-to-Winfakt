import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUrlParams } from '@/hooks/use-url-params';
import {
  saveConfiguration,
  loadConfiguration,
  deleteConfiguration,
  listConfigurations,
  configurationExists
} from '@/utils/configurationApi';
import type {
  SavedConfiguration,
  ConfigurationListItem,
  SaveConfigurationRequest
} from '@/types/configuration';

/**
 * Hook for managing configurations with the new dossier-based system
 */
export function useConfigurationApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [configurations, setConfigurations] = useState<ConfigurationListItem[]>([]);
  const { toast } = useToast();
  const { dossier, updateConfig } = useUrlParams();

  /**
   * Save current configuration with given name
   */
  const saveConfig = useCallback(async (configurationName: string, configurationData: any): Promise<SavedConfiguration | null> => {
    setIsLoading(true);
    try {
      const request: SaveConfigurationRequest = {
        dossier_number: dossier,
        configuration_name: configurationName,
        configuration_data: configurationData
      };

      const savedConfig = await saveConfiguration(request);
      
      return savedConfig;
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Fout bij opslaan",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [dossier, toast]);

  /**
   * Load a configuration by name
   */
  const loadConfig = useCallback(async (configurationName: string): Promise<SavedConfiguration | null> => {
    setIsLoading(true);
    try {
      const config = await loadConfiguration({
        dossier_number: dossier,
        configuration_name: configurationName
      });

      if (!config) {
        // Don't show toast for missing config - just return null silently
        // The URL config parameter will be cleared by the calling code
      }

      return config;
    } catch (error) {
      console.error('Error loading configuration:', error);
      // Error toast is handled by the calling code for better context
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [dossier]);

  /**
   * Delete a configuration by name
   */
  const deleteConfig = async (configurationName: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await deleteConfiguration({
        dossier_number: dossier,
        configuration_name: configurationName
      });

      // Refresh the configurations list
      await refreshConfigurations();

      return true;
    } catch (error) {
      console.error('Error deleting configuration:', error);
      toast({
        title: "Fout bij verwijderen",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh the list of configurations for current dossier
   */
  const refreshConfigurations = useCallback(async (): Promise<void> => {
    console.log('Starting refreshConfigurations for dossier:', dossier);
    setIsLoading(true);
    try {
      const configs = await listConfigurations({
        dossier_number: dossier
      });
      console.log('Loaded configurations:', configs);
      setConfigurations(configs);
    } catch (error) {
      console.error('Error refreshing configurations:', error);
      // Don't show toast for configuration list refresh errors - not critical
      setConfigurations([]);
    } finally {
      console.log('Finished refreshConfigurations, setting isLoading to false');
      setIsLoading(false);
    }
  }, [dossier]);

  /**
   * Check if a configuration name exists
   */
  const checkConfigExists = async (configurationName: string): Promise<boolean> => {
    try {
      return await configurationExists(dossier, configurationName);
    } catch (error) {
      console.error('Error checking configuration existence:', error);
      return false;
    }
  };

  return {
    isLoading,
    configurations,
    dossier,
    saveConfig,
    loadConfig,
    deleteConfig,
    refreshConfigurations,
    checkConfigExists
  };
}