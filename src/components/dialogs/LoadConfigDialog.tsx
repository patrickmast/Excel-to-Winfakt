import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConfigurationApi } from '@/hooks/use-configuration-api';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import type { ConfigurationListItem } from '@/types/configuration';

interface LoadConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigurationLoaded?: (configName: string, configData: any) => void;
}

const LoadConfigDialog = ({ 
  open, 
  onOpenChange, 
  onConfigurationLoaded 
}: LoadConfigDialogProps) => {
  const [selectedConfig, setSelectedConfig] = useState<ConfigurationListItem | null>(null);
  const { 
    configurations, 
    isLoading, 
    loadConfig, 
    refreshConfigurations,
    dossier 
  } = useConfigurationApi();
  const { t } = useTranslation();

  // Refresh configurations when dialog opens
  useEffect(() => {
    if (open) {
      refreshConfigurations();
      setSelectedConfig(null);
    }
  }, [open, refreshConfigurations]);

  const handleLoad = async () => {
    if (!selectedConfig) return;

    // Close dialog immediately for better UX
    onOpenChange(false);
    
    const loadedConfig = await loadConfig(selectedConfig.configuration_name);
    
    if (loadedConfig) {
      onConfigurationLoaded?.(loadedConfig.configuration_name, loadedConfig.configuration_data);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: nl 
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('menu.load')}</DialogTitle>
          <DialogDescription>
            Selecteer een opgeslagen configuratie om te laden voor dossier {dossier}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Configuraties laden...</div>
            </div>
          ) : configurations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-sm text-muted-foreground mb-2">
                Geen opgeslagen configuraties gevonden voor dossier {dossier}
              </div>
              <div className="text-xs text-muted-foreground">
                Gebruik het menu om een configuratie op te slaan
              </div>
            </div>
          ) : (
            <ScrollArea className="h-64 pr-2">
              <div className="space-y-2 pr-1">
                {configurations.map((config) => (
                  <div
                    key={config.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedConfig?.id === config.id
                        ? 'bg-primary/10 border-primary'
                        : 'bg-card hover:bg-muted'
                    }`}
                    onClick={() => setSelectedConfig(config)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {config.configuration_name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Aangemaakt: {formatDate(config.created_at)}
                      </div>
                      {config.updated_at !== config.created_at && (
                        <div className="text-xs text-muted-foreground">
                          Gewijzigd: {formatDate(config.updated_at)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Annuleren
          </Button>
          <Button
            onClick={handleLoad}
            disabled={!selectedConfig || isLoading}
          >
            {isLoading ? 'Bezig...' : 'Laden'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoadConfigDialog;