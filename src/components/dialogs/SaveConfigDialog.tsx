import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  PM7Dialog,
  PM7DialogContent,
  PM7DialogHeader,
  PM7DialogTitle,
  PM7DialogDescription,
  PM7DialogFooter,
} from 'pm7-ui-style-guide';
import { useConfigurationApi } from '@/hooks/use-configuration-api';
import { useConfigurationContext } from '@/contexts/ConfigurationContext';
import { useTranslation } from 'react-i18next';
import { useToast } from 'pm7-ui-style-guide';

interface SaveConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configurationData: any;
  onConfigurationSaved?: (configName: string) => void;
  currentConfigName?: string;
}

const SaveConfigDialog = ({ 
  open, 
  onOpenChange, 
  configurationData, 
  onConfigurationSaved,
  currentConfigName
}: SaveConfigDialogProps) => {
  const [configName, setConfigName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const isInitialOpen = useRef(false);
  const { toast } = useToast();
  const { saveConfig, dossier } = useConfigurationApi();
  const { configurations, refreshConfigurations } = useConfigurationContext();
  const { t } = useTranslation();

  // Reset when dialog opens/closes
  useEffect(() => {
    if (open) {
      // Only pre-fill on first open of the session
      if (!isInitialOpen.current) {
        setConfigName(currentConfigName || '');
        isInitialOpen.current = true;
      }
    } else {
      // Reset only when dialog closes
      setConfigName('');
      isInitialOpen.current = false;
    }
  }, [open, currentConfigName]);

  const handleSave = async () => {
    if (!configName.trim()) {
      toast({
        title: "Naam vereist",
        description: "Gelieve eerst een naam te geven om de instellingen op te slaan.",
        variant: "destructive",
      });
      return;
    }

    // Close dialog immediately
    onOpenChange(false);
    onConfigurationSaved?.(configName.trim());

    try {
      const savedConfig = await saveConfig(configName.trim(), configurationData);
      
      if (savedConfig) {
        // Refresh configurations list in background
        refreshConfigurations();
      }
    } catch (error) {
      toast({
        title: "Fout bij opslaan",
        description: "Er is een fout opgetreden bij het opslaan van de configuratie.",
        variant: "destructive",
      });
    }
  };

  return (
    <PM7Dialog open={open} onOpenChange={onOpenChange}>
      <PM7DialogContent>
        <PM7DialogHeader>
          <PM7DialogTitle>{t('menu.save')}</PM7DialogTitle>
          <PM7DialogDescription>
            Geef een naam op voor deze configuratie. Als de naam al bestaat wordt deze overschreven.
          </PM7DialogDescription>
        </PM7DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Dossier</Label>
            <Input value={dossier} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="config-name">Configuratie naam</Label>
            <Input
              id="config-name"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="Nieuwe configuratie naam..."
              autoFocus
            />
          </div>

          {configurations.length > 0 && (
            <div className="space-y-2">
              <Label>Bestaande configuraties</Label>
              <div className="max-h-32 overflow-y-auto border rounded-md p-2 bg-muted/50">
                {configurations.map((config, index) => (
                  <div 
                    key={index} 
                    className="text-sm text-muted-foreground cursor-pointer hover:text-foreground p-1 rounded hover:bg-muted/50"
                    onClick={() => setConfigName(config.configuration_name)}
                  >
                    {config.configuration_name}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Klik op een naam om deze te selecteren
              </p>
            </div>
          )}
        </div>

        <PM7DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Annuleren
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            Opslaan
          </Button>
        </PM7DialogFooter>
      </PM7DialogContent>
    </PM7Dialog>
  );
};

export default SaveConfigDialog;