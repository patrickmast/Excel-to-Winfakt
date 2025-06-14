import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useUrlParams } from '@/hooks/use-url-params';
import { listConfigurations } from '@/utils/configurationApi';
import type { ConfigurationListItem } from '@/types/configuration';

interface ConfigurationContextType {
  configurations: ConfigurationListItem[];
  isLoading: boolean;
  refreshConfigurations: () => Promise<void>;
}

const ConfigurationContext = createContext<ConfigurationContextType | undefined>(undefined);

export const ConfigurationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [configurations, setConfigurations] = useState<ConfigurationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { dossier } = useUrlParams();

  const refreshConfigurations = useCallback(async () => {
    if (!dossier) return;
    
    setIsLoading(true);
    try {
      const configs = await listConfigurations({
        dossier_number: dossier
      });
      setConfigurations(configs);
    } catch (error) {
      console.error('Error loading configurations:', error);
      setConfigurations([]);
    } finally {
      setIsLoading(false);
    }
  }, [dossier]);

  // Load configurations when dossier changes
  useEffect(() => {
    if (dossier) {
      refreshConfigurations();
    }
  }, [dossier, refreshConfigurations]);

  return (
    <ConfigurationContext.Provider value={{ configurations, isLoading, refreshConfigurations }}>
      {children}
    </ConfigurationContext.Provider>
  );
};

export const useConfigurationContext = () => {
  const context = useContext(ConfigurationContext);
  if (!context) {
    throw new Error('useConfigurationContext must be used within a ConfigurationProvider');
  }
  return context;
};