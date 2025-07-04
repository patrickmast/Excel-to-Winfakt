import { Badge } from './ui/badge';
import { useUrlParams } from '@/hooks/use-url-params';
import { Save } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ConfigurationIndicatorProps {
  className?: string;
  onSaveConfiguration?: () => void;
  hasUnsavedChanges?: boolean;
  isLoadingConfig?: boolean;
}

const ConfigurationIndicator = ({ className = '', onSaveConfiguration, hasUnsavedChanges = false, isLoadingConfig = false }: ConfigurationIndicatorProps) => {
  const { dossier, config } = useUrlParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasClickedSave, setHasClickedSave] = useState(false);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProcessing(true);
    setHasClickedSave(true);
    onSaveConfiguration?.();
    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };

  const handleMouseLeave = () => {
    if (hasClickedSave) {
      setHasClickedSave(false);
    }
  };

  const truncateConfigName = (name: string) => {
    if (name.length <= 30) return name;
    return name.substring(0, 30) + '...';
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Dossier:</span>
        <span className="inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-default bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 hover:text-blue-800 font-mono">
          {dossier}
        </span>
      </div>
      
      {config && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">Configuratie:</span>
          <div className="relative">
            <span 
              className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-default ${
                (hasUnsavedChanges && !isLoadingConfig)
                  ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100 hover:text-red-800' 
                  : 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800'
              }`}
            >
              <span className="relative group">
                {(hasUnsavedChanges && !isLoadingConfig) && <span className="text-red-600 mr-1">●</span>}
                {truncateConfigName(config)}
                <div className="absolute z-50 invisible group-hover:visible group-hover:delay-300 bg-gray-900 text-white text-xs rounded py-1 px-2 bottom-full left-1/2 transform -translate-x-1/2 mb-1 whitespace-nowrap pointer-events-none">
                  {(hasUnsavedChanges && !isLoadingConfig) && "Niet opgeslagen wijzigingen - "}
                  {config}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </span>
              <div className={`relative ${isProcessing || hasClickedSave ? '' : 'group/save'}`} onMouseLeave={handleMouseLeave}>
                <Save 
                  size={12} 
                  className="cursor-pointer hover:text-black" 
                  style={isProcessing ? { color: '#2663EC' } : {}}
                  onClick={handleSaveClick}
                />
                <div 
                  className={`absolute z-50 bg-gray-900 text-white text-xs rounded py-1 px-2 bottom-full left-1/2 transform -translate-x-1/2 mb-1 whitespace-nowrap ${
                    isProcessing 
                      ? 'visible pointer-events-none' 
                      : 'invisible group-hover/save:visible group-hover/save:delay-300 pointer-events-none'
                  }`}
                  style={isProcessing ? { visibility: 'visible !important', display: 'block !important' } : {}}
                >
                  {isProcessing ? 'Instellingen opslaan..' : 'Configuratie opslaan'}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </span>
          </div>
        </div>
      )}
      
      {!config && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">Configuratie:</span>
          <div className="relative">
            <span 
              className="inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-default bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800"
            >
              <span className="relative group">
                Geen configuratie geladen
                <div className="absolute z-50 invisible group-hover:visible group-hover:delay-300 bg-gray-900 text-white text-xs rounded py-1 px-2 bottom-full left-1/2 transform -translate-x-1/2 mb-1 whitespace-nowrap pointer-events-none">
                  Klik op het opslaan icoon om deze configuratie een naam te geven
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </span>
              <div className={`relative ${isProcessing || hasClickedSave ? '' : 'group/save'}`} onMouseLeave={handleMouseLeave}>
                <Save 
                  size={12} 
                  className="cursor-pointer hover:text-black" 
                  style={isProcessing ? { color: '#2663EC' } : {}}
                  onClick={handleSaveClick}
                />
                <div 
                  className={`absolute z-50 bg-gray-900 text-white text-xs rounded py-1 px-2 bottom-full left-1/2 transform -translate-x-1/2 mb-1 whitespace-nowrap ${
                    isProcessing 
                      ? 'visible pointer-events-none' 
                      : 'invisible group-hover/save:visible group-hover/save:delay-300 pointer-events-none'
                  }`}
                  style={isProcessing ? { visibility: 'visible !important', display: 'block !important' } : {}}
                >
                  {isProcessing ? 'Instellingen opslaan..' : 'Nieuwe configuratie opslaan'}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationIndicator;