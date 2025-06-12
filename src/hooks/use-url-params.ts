import { useState, useEffect } from 'react';
import { parseUrlParams, updateUrlParams, type UrlParams } from '@/utils/urlParams';

/**
 * Hook for managing URL parameters (dossier and config)
 * Provides current values and functions to update them
 */
export function useUrlParams() {
  const [urlParams, setUrlParams] = useState<UrlParams>(() => parseUrlParams());

  // Listen for URL changes (back/forward navigation and programmatic updates)
  useEffect(() => {
    const handleUrlChange = () => {
      setUrlParams(parseUrlParams());
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('urlParamsUpdated', handleUrlChange);
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('urlParamsUpdated', handleUrlChange);
    };
  }, []);

  /**
   * Update URL parameters and local state
   */
  const updateParams = (dossier: string, config?: string, replaceState: boolean = true) => {
    updateUrlParams(dossier, config, replaceState);
    setUrlParams({ dossier, config });
  };

  /**
   * Update only the config parameter, keeping current dossier
   */
  const updateConfig = (config?: string, replaceState: boolean = true) => {
    updateParams(urlParams.dossier, config, replaceState);
  };

  /**
   * Clear config parameter, keeping current dossier
   */
  const clearConfig = (replaceState: boolean = true) => {
    updateParams(urlParams.dossier, undefined, replaceState);
  };

  return {
    dossier: urlParams.dossier,
    config: urlParams.config,
    updateParams,
    updateConfig,
    clearConfig
  };
}