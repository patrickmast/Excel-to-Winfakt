/**
 * Utility functions for handling URL parameters related to dossier and configuration
 */

export interface UrlParams {
  dossier: string;
  config?: string;
}

/**
 * Parse URL parameters and extract dossier and config values
 * @returns Object with dossier (defaults to "99999") and optional config name
 */
export function parseUrlParams(): UrlParams {
  const searchParams = new URLSearchParams(window.location.search);
  
  const dossier = searchParams.get('dossier') || '99999';
  const config = searchParams.get('config') || undefined;
  
  return {
    dossier,
    config
  };
}

/**
 * Update URL with new dossier and config parameters
 * @param dossier Dossier number
 * @param config Configuration name (optional)
 * @param replaceState Whether to replace current state or push new state (default: true)
 */
export function updateUrlParams(dossier: string, config?: string, replaceState: boolean = true): void {
  const url = new URL(window.location.href);
  
  url.searchParams.set('dossier', dossier);
  
  if (config) {
    url.searchParams.set('config', config);
  } else {
    url.searchParams.delete('config');
  }
  
  const method = replaceState ? 'replaceState' : 'pushState';
  window.history[method]({}, '', url.toString());
  
  // Dispatch custom event to notify listeners
  window.dispatchEvent(new CustomEvent('urlParamsUpdated'));
}

/**
 * Get current dossier from URL or return default
 */
export function getCurrentDossier(): string {
  return parseUrlParams().dossier;
}

/**
 * Get current config from URL if present
 */
export function getCurrentConfig(): string | undefined {
  return parseUrlParams().config;
}