import { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import {
  PM7Dialog,
  PM7DialogContent,
  PM7DialogHeader,
  PM7DialogTitle,
  PM7DialogDescription,
  PM7DialogFooter,
  PM7Button,
} from 'pm7-ui-style-guide';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConfigurationApi } from '@/hooks/use-configuration-api';
import { useConfigurationContext } from '@/contexts/ConfigurationContext';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import type { ConfigurationListItem } from '@/types/configuration';

interface DeleteConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigurationsDeleted?: (deletedNames: string[]) => void;
}

const DeleteConfigDialog = ({ 
  open, 
  onOpenChange, 
  onConfigurationsDeleted 
}: DeleteConfigDialogProps) => {
  const [selectedConfigs, setSelectedConfigs] = useState<Set<string>>(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { deleteConfig, dossier } = useConfigurationApi();
  const { configurations, isLoading, refreshConfigurations } = useConfigurationContext();
  const { t } = useTranslation();

  // Reset selection when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedConfigs(new Set());
    }
  }, [open]);

  const handleToggleConfig = (configId: string, configName: string) => {
    const newSelected = new Set(selectedConfigs);
    if (newSelected.has(configName)) {
      newSelected.delete(configName);
    } else {
      newSelected.add(configName);
    }
    setSelectedConfigs(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedConfigs.size === configurations.length) {
      setSelectedConfigs(new Set());
    } else {
      setSelectedConfigs(new Set(configurations.map(c => c.configuration_name)));
    }
  };

  const handleDelete = async () => {
    const configsToDelete = Array.from(selectedConfigs);
    let deletedConfigs: string[] = [];

    for (const configName of configsToDelete) {
      const success = await deleteConfig(configName);
      if (success) {
        deletedConfigs.push(configName);
      }
    }

    if (deletedConfigs.length > 0) {
      onConfigurationsDeleted?.(deletedConfigs);
      setSelectedConfigs(new Set());
      
      // Refresh the list after deletion
      await refreshConfigurations();
    }

    setShowConfirmDialog(false);
    
    // Close main dialog if all configurations were deleted
    if (configurations.length === deletedConfigs.length) {
      onOpenChange(false);
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

  const selectedCount = selectedConfigs.size;

  return (
    <>
      <PM7Dialog open={open} onOpenChange={onOpenChange}>
        <PM7DialogContent>
          <PM7DialogHeader>
            <PM7DialogTitle>{t('menu.delete')}</PM7DialogTitle>
            <PM7DialogDescription>
              Selecteer configuraties die je wilt verwijderen voor dossier {dossier}.
            </PM7DialogDescription>
          </PM7DialogHeader>
          
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
                  Er zijn geen configuraties om te verwijderen
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedCount === configurations.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <label htmlFor="select-all" className="text-sm font-medium">
                      Alles selecteren ({configurations.length})
                    </label>
                  </div>
                  {selectedCount > 0 && (
                    <Badge variant="secondary">
                      {selectedCount} geselecteerd
                    </Badge>
                  )}
                </div>

                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {configurations.map((config) => (
                      <div
                        key={config.id}
                        className="flex items-start space-x-3 p-3 rounded-lg border bg-card"
                      >
                        <Checkbox
                          id={`config-${config.id}`}
                          checked={selectedConfigs.has(config.configuration_name)}
                          onCheckedChange={() => handleToggleConfig(config.id, config.configuration_name)}
                        />
                        <div className="flex-1 min-w-0">
                          <label 
                            htmlFor={`config-${config.id}`}
                            className="font-medium truncate cursor-pointer block"
                          >
                            {config.configuration_name}
                          </label>
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
              </>
            )}
          </div>

          <PM7DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <PM7Button
              type="button"
              className="pm7-button-ghost"
              onClick={() => onOpenChange(false)}
            >
              Annuleren
            </PM7Button>
            <PM7Button
              className="pm7-button-destructive"
              onClick={() => setShowConfirmDialog(true)}
              disabled={selectedCount === 0 || isLoading}
            >
              {selectedCount === 0 ? 'Verwijderen' : `${selectedCount} verwijderen`}
            </PM7Button>
          </PM7DialogFooter>
        </PM7DialogContent>
      </PM7Dialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Configuraties verwijderen</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je {selectedCount} configuratie{selectedCount !== 1 ? 's' : ''} wilt verwijderen?
              Deze actie kan niet ongedaan worden gemaakt.
              {selectedCount > 0 && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <strong>Te verwijderen:</strong>
                  <ul className="mt-1 space-y-1">
                    {Array.from(selectedConfigs).map(name => (
                      <li key={name} className="text-xs">• {name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ja, verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteConfigDialog;