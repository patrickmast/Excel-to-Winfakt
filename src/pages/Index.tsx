import { useState, useEffect, useCallback } from 'react';
import ColumnMapper from '../components/ColumnMapper';
import { useToast } from '../components/ui/use-toast';
import { downloadCSV } from '../utils/csvUtils';
import { Menu, Save, Plus, Info } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { useConfiguration } from '@/hooks/use-configuration';
import SavedConfigDialog from '@/components/column-mapper/SavedConfigDialog';
import InfoDialog from '@/components/column-mapper/InfoDialog';
import { ConfigurationSettings } from '@/components/column-mapper/types';
import PageHeader from './index/PageHeader';
import { useMappingReducer } from '@/hooks/use-mapping-reducer';

const Index = () => {
  const {
    state: mappingState,
    loadConfiguration,
    setMapping,
    setSourceData,
    resetState
  } = useMappingReducer();

  const [activeColumnSet, setActiveColumnSet] = useState<'artikelen' | 'klanten'>('artikelen');
  const { toast } = useToast();
  const { saveConfiguration, isSaving } = useConfiguration();
  const [currentConfigId, setCurrentConfigId] = useState<string | null>(null);
  const [showSavedDialog, setShowSavedDialog] = useState(false);
  const [savedConfigUrl, setSavedConfigUrl] = useState('');
  const [searchParams] = useSearchParams();
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [sourceFileInfo, setSourceFileInfo] = useState<{ filename: string; rowCount: number; worksheetName?: string } | null>(null);
  const [shouldResetMapper, setShouldResetMapper] = useState(false);

  const handleLoadConfiguration = useCallback(async (id: string) => {
    try {
      const { data: config, error } = await supabase
        .from('shared_configurations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!config) return;

      setCurrentConfigId(config.id);
      const settings = config.settings as unknown as ConfigurationSettings;

      // Load all state properties in a single atomic update
      loadConfiguration(settings);

      // Update source file info if available
      if (settings.sourceColumns) {
        setSourceFileInfo({
          filename: settings.sourceFilename || '',
          rowCount: settings.sourceData?.length || 0,
          worksheetName: settings.worksheetName
        });
      }

      toast({
        title: "Configuration loaded",
        description: "The saved configuration has been loaded successfully.",
      });
    } catch (error) {
      console.error('Error loading configuration:', error);
      toast({
        title: "Error",
        description: "Failed to load the saved configuration",
        variant: "destructive",
      });
    }
  }, [loadConfiguration, toast]);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      handleLoadConfiguration(id);
    }
  }, [searchParams, handleLoadConfiguration]);

  const handleMappingChange = (mapping: Record<string, string>) => {
    setMapping(mapping);
  };

  const handleSaveConfiguration = async (isNewConfig: boolean = true) => {
    // Save the entire mapping state
    const result = await saveConfiguration({
      mapping: mappingState.mapping,
      columnTransforms: mappingState.columnTransforms,
      sourceColumns: mappingState.sourceColumns,
      sourceData: mappingState.sourceData,
      connectionCounter: mappingState.connectionCounter,
      sourceFilename: mappingState.sourceFilename
    }, isNewConfig);

    if (result) {
      setCurrentConfigId(result.id);
      if (isNewConfig) {
        const configUrl = `${window.location.origin}?id=${result.id}`;
        setSavedConfigUrl(configUrl);
        setShowSavedDialog(true);
      } else {
        toast({
          title: "Success",
          description: "Configuration updated successfully",
        });
      }
    }
  };

  const handleClearSettings = useCallback(() => {
    // Reset all state
    resetState();
    setSourceFileInfo(null);
    setCurrentConfigId(null);
    setShouldResetMapper(true);

    toast({
      title: "Settings Cleared",
      description: "All settings have been reset to default",
      duration: 3000,
      variant: "default"
    });
  }, [resetState, toast]);

  // Reset the flag after a short delay to allow the reset to complete
  useEffect(() => {
    if (shouldResetMapper) {
      const timer = setTimeout(() => setShouldResetMapper(false), 100);
      return () => clearTimeout(timer);
    }
  }, [shouldResetMapper]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SavedConfigDialog
        open={showSavedDialog}
        onOpenChange={setShowSavedDialog}
        configUrl={savedConfigUrl}
      />

      <InfoDialog
        open={showInfoDialog}
        onOpenChange={setShowInfoDialog}
        configId={currentConfigId}
        sourceFileName={sourceFileInfo?.filename}
        sourceRowCount={sourceFileInfo?.rowCount}
        worksheetName={sourceFileInfo?.worksheetName}
      />

      <div className="container mx-auto px-4 py-8 flex-grow">
        <PageHeader
          onSaveNew={() => handleSaveConfiguration(true)}
          onSave={() => handleSaveConfiguration(false)}
          onInfo={() => setShowInfoDialog(true)}
          onClearSettings={handleClearSettings}
          isSaving={isSaving}
        />

        <ColumnMapper
          onMappingChange={handleMappingChange}
          onExport={() => {
            handleMappingChange(mappingState.mapping);
          }}
          onDataLoaded={(data) => {
            const columns = data.length > 0 ? mappingState.sourceColumns : [];
            setSourceData(columns, data);
          }}
          targetColumns={activeColumnSet === 'artikelen' ? ARTIKEL_COLUMNS : KLANTEN_COLUMNS}
          activeColumnSet={activeColumnSet}
          onColumnSetChange={setActiveColumnSet}
          onSourceFileChange={setSourceFileInfo}
          shouldReset={shouldResetMapper}
        />
      </div>
    </div>
  );
};

const ARTIKEL_COLUMNS = [
  // Basic fields
  "Actief?", "Stock verwerken?", "Artikelnummer", "Omschrijving", "Omschrijving NL",
  "Omschrijving GB", "Omschrijving DE", "Omschrijving FR", "Omschrijving TR",
  "BTW-percentage",

  // Price fields
  "Netto verkoopprijs 1", "Netto verkoopprijs 2", "Netto verkoopprijs 3",
  "Netto verkoopprijs 4", "Netto verkoopprijs 5", "Netto verkoopprijs 6", "Netto verkoopprijs 7",
  "Netto verkoopprijs 8", "Netto verkoopprijs 9", "Netto verkoopprijs 10", "Netto aankoopprijs",
  "Catalogusprijs",

  // Product identification fields
  "Artikelnummer fabrikant", "Artikelnummer leverancier", "Leveranciersnummer",
  "merk", "Recupel", "Auvibel", "Bebat", "Reprobel", "Leeggoed", "Accijnzen", "Ecoboni",
  "Barcode", "Rekeningnummer",

  // Extra numeric fields
  ...Array.from({length: 20}, (_, i) => `Numeriek extra veld ${i + 1}`),

  // Extra alphanumeric fields
  ...Array.from({length: 20}, (_, i) => `Alfanumeriek extra veld ${i + 1}`),

  // Extra logical fields
  ...Array.from({length: 20}, (_, i) => `Logisch extra veld ${i + 1}`),

  // Stock location fields
  ...Array.from({length: 9}, (_, i) => `Voorraad locatie ${i + 1}`),
  ...Array.from({length: 9}, (_, i) => `Voorraad locatie ${i + 1} toevoegen`),

  // Additional fields
  "Is beginstock", "Hoofdgroep", "Subgroep", "Eenheid", "Korting uitgeschakeld",
  "Gemarkeerd voor label printer", "Aantal 2",

  // Intrastat fields
  "Intrastat, lidstaat van herkomst", "Intrastat, standaard gewest",
  "Intrastat, goederencode", "Intrastat, gewicht per eenheid", "Intrastat, land van oorsprong",

  // Minimum stock fields
  "Minimum voorraad (ja/nee)", "Minimum voorraad (aantal)", "Minimum bestelhoeveelheid",

  // Price date ranges
  ...Array.from({length: 10}, (_, i) => [
    `Prijs ${i + 1}, datum van`,
    `Prijs ${i + 1}, datum tot`
  ]).flat(),
];

const KLANTEN_COLUMNS = [
  "Actief?",
  "Contactnummer",
  "Info",
  "Btw-nummer",
  "Standaard betalingstermijn",
  "Ondernemingsnummer",
  "Maximum herinnering",
  "Bedrijfsnaam",
  "Achternaam",
  "Voornaam",
  "Adres",
  "Adreslijn 2",
  "Nummer",
  "Bus",
  "Postcode",
  "E-mail",
  "Telefoon",
  "gsm",
  "Fax",
  "Stad",
  "Taal",
  "Landcode",
  "Betaling einde maand?",
  "Numeriek extra veld 1",
  "Numeriek extra veld 2",
  "Numeriek extra veld 3",
  "Numeriek extra veld 4",
  "Numeriek extra veld 5",
  "Numeriek extra veld 6",
  "Numeriek extra veld 7",
  "Numeriek extra veld 8",
  "Numeriek extra veld 9",
  "Numeriek extra veld 10",
  "Numeriek extra veld 11",
  "Numeriek extra veld 12",
  "Numeriek extra veld 13",
  "Numeriek extra veld 14",
  "Numeriek extra veld 15",
  "Numeriek extra veld 16",
  "Numeriek extra veld 17",
  "Numeriek extra veld 18",
  "Numeriek extra veld 19",
  "Numeriek extra veld 20",
  "Alfanumeriek extra veld 1",
  "Alfanumeriek extra veld 2",
  "Alfanumeriek extra veld 3",
  "Alfanumeriek extra veld 4",
  "Alfanumeriek extra veld 5",
  "Alfanumeriek extra veld 6",
  "Alfanumeriek extra veld 7",
  "Alfanumeriek extra veld 8",
  "Alfanumeriek extra veld 9",
  "Alfanumeriek extra veld 10",
  "Alfanumeriek extra veld 11",
  "Alfanumeriek extra veld 12",
  "Alfanumeriek extra veld 13",
  "Alfanumeriek extra veld 14",
  "Alfanumeriek extra veld 15",
  "Alfanumeriek extra veld 16",
  "Alfanumeriek extra veld 17",
  "Alfanumeriek extra veld 18",
  "Alfanumeriek extra veld 19",
  "Alfanumeriek extra veld 20",
  "Logisch extra veld 1",
  "Logisch extra veld 2",
  "Logisch extra veld 3",
  "Logisch extra veld 4",
  "Logisch extra veld 5",
  "Logisch extra veld 6",
  "Logisch extra veld 7",
  "Logisch extra veld 8",
  "Logisch extra veld 9",
  "Logisch extra veld 10",
  "Logisch extra veld 11",
  "Logisch extra veld 12",
  "Logisch extra veld 13",
  "Logisch extra veld 14",
  "Logisch extra veld 15",
  "Logisch extra veld 16",
  "Logisch extra veld 17",
  "Logisch extra veld 18",
  "Logisch extra veld 19",
  "Logisch extra veld 20",
  "Tijd veld 1",
  "Tijd veld 2",
  "Tijd veld 3",
  "Tijd veld 4",
  "Tijd veld 5",
  "Tijd veld 6",
  "Tijd veld 7",
  "Tijd veld 8",
  "Tijd veld 9",
  "Tijd veld 10",
  "Tijd veld 11",
  "Tijd veld 12",
  "Tijd veld 13",
  "Tijd veld 14",
  "Tijd veld 15",
  "Tijd veld 16",
  "Tijd veld 17",
  "Tijd veld 18",
  "Tijd veld 19",
  "Tijd veld 20"
];

export default Index;