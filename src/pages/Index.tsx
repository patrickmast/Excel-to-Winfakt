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
import LogDialog from '@/components/column-mapper/LogDialog';
import { ConfigurationSettings } from '@/components/column-mapper/types';
import PageHeader from './index/PageHeader';
import { useMappingReducer } from '@/hooks/use-mapping-reducer';

const Index = () => {
  const {
    state: mappingState,
    loadConfiguration,
    setMapping,
    setSourceData,
    resetState,
    updateTransforms,
    setFilter
  } = useMappingReducer();

  const [activeColumnSet, setActiveColumnSet] = useState<'artikelen' | 'klanten'>('artikelen');
  const { toast } = useToast();
  const { saveConfiguration, isSaving } = useConfiguration();
  const [currentConfigId, setCurrentConfigId] = useState<string | null>(null);
  const [showSavedDialog, setShowSavedDialog] = useState(false);
  const [savedConfigUrl, setSavedConfigUrl] = useState('');
  const [searchParams] = useSearchParams();
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [latestReport, setLatestReport] = useState<string | null>(null);
  const [exportData, setExportData] = useState<any[] | null>(null);
  const [sourceFileInfo, setSourceFileInfo] = useState<{ filename: string; rowCount: number; worksheetName?: string; size?: number } | null>(null);
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

  interface ConfigurationResult {
    id: string;
  }

  const handleSaveConfiguration = async (isNewConfig: boolean = true) => {
    // Save the entire mapping state
    const id = await saveConfiguration({
      mapping: mappingState.mapping,
      columnTransforms: mappingState.columnTransforms,
      sourceColumns: mappingState.sourceColumns,
      sourceData: mappingState.sourceData,
      connectionCounter: mappingState.connectionCounter,
      sourceFilename: mappingState.sourceFilename,
      selectedSourceColumn: mappingState.selectedSourceColumn,
      selectedTargetColumn: mappingState.selectedTargetColumn,
      sourceSearch: mappingState.sourceSearch,
      targetSearch: mappingState.targetSearch,
      activeFilter: mappingState.activeFilter
    }, isNewConfig);

    if (id) {
      setCurrentConfigId(String(id));
      if (isNewConfig) {
        const configUrl = `${window.location.origin}?id=${id}`;
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

  const handleDisconnect = (uniqueKey: string) => {
    const newMapping = { ...mappingState.mapping };
    delete newMapping[uniqueKey];
    setMapping(newMapping);
  };

  const handleExport = useCallback(async (data: any[], sourceFilename: string) => {
    if (!sourceFilename) {
      return;
    }
    
    // Show the log dialog immediately
    setShowLogDialog(true);
    
    // Pass the data to LogDialog for processing
    setExportData(data);
  }, []);

  const handleExportComplete = useCallback((report: string, exportedData: any[]) => {
    setLatestReport(report);
  }, []);

  const handleUpdateTransform = (uniqueKey: string, code: string) => {
    updateTransforms({
      ...mappingState.columnTransforms,
      [uniqueKey]: code
    });
  };

  const handleReorder = (newOrder: [string, string, string][]) => {
    const newMapping: Record<string, string> = {};
    newOrder.forEach(([key, source, target]) => {
      newMapping[key] = mappingState.mapping[key];
    });
    setMapping(newMapping);
  };

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
        sourceFileInfo={sourceFileInfo}
      />

      <LogDialog
        open={showLogDialog}
        onOpenChange={setShowLogDialog}
        data={exportData}
        sourceFilename={mappingState.sourceFilename}
        sourceFileSize={mappingState.sourceFileSize}
        worksheetName={mappingState.worksheetName}
        onExportComplete={handleExportComplete}
      />

      <div className="container mx-auto px-4 py-8 flex-grow">
        <PageHeader
          onSaveNew={() => handleSaveConfiguration(true)}
          onSave={() => handleSaveConfiguration(false)}
          onInfo={() => setShowInfoDialog(true)}
          onClearSettings={handleClearSettings}
          onShowLog={() => {
            if (latestReport) {
              setShowLogDialog(true);
            } else {
              toast({
                title: "No Export Report",
                description: "Export a file first to generate a report.",
                variant: "default"
              });
            }
          }}
          isSaving={isSaving}
        />

        <ColumnMapper
          onMappingChange={handleMappingChange}
          onExport={(data) => handleExport(data, mappingState.sourceFilename || '')}
          onDataLoaded={(columns, data, filename, worksheetName, fileSize) => {
            setSourceData(columns, data, { filename, worksheetName });
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
  // Priority fields in specified order
  "Artikelnummer", "Omschrijving", "Catalogusprijs", "Netto aankoopprijs",
  "Netto verkoopprijs 1", "BTW-percentage",
  
  // Tax fields
  "Recupel", "Auvibel", "Bebat", "Reprobel", "Accijnzen", "Ecoboni",
  "Leeggoed",
  
  // Product details
  "Eenheid", "Barcode", "Leveranciersnummer", "Artikelnummer fabrikant", "Artikelnummer leverancier",
  "Hoofdgroep", "Subgroep",
  
  // Stock fields
  "Stock verwerken?", "Minimum voorraad (ja/nee)", "Minimum voorraad (aantal)", "Minimum bestelhoeveelheid",
  
  // Stock location fields
  ...Array.from({length: 9}, (_, i) => `Voorraad locatie ${i + 1}`),
  ...Array.from({length: 9}, (_, i) => `Voorraad locatie ${i + 1} toevoegen`),
  "Is beginstock",
  
  // Status fields
  "Actief?", "Korting uitgeschakeld",
  
  // Language descriptions
  "Omschrijving NL", "Omschrijving GB", "Omschrijving DE", "Omschrijving FR", "Omschrijving TR",
  
  // Additional price fields
  "Netto verkoopprijs 2", "Netto verkoopprijs 3", "Netto verkoopprijs 4", "Netto verkoopprijs 5",
  "Netto verkoopprijs 6", "Netto verkoopprijs 7", "Netto verkoopprijs 8", "Netto verkoopprijs 9", "Netto verkoopprijs 10",

  // Extra fields in specified order
  ...Array.from({length: 20}, (_, i) => `Alfanumeriek extra veld ${i + 1}`),
  ...Array.from({length: 20}, (_, i) => `Numeriek extra veld ${i + 1}`),
  ...Array.from({length: 20}, (_, i) => `Logisch extra veld ${i + 1}`),

  // Price date ranges
  ...Array.from({length: 10}, (_, i) => [
    `Prijs ${i + 1}, datum van`,
    `Prijs ${i + 1}, datum tot`
  ]).flat(),

  // Remaining fields in specified order
  "merk", "Rekeningnummer", "Gemarkeerd voor label printer", "Aantal 2",

  // Intrastat fields
  "Intrastat, lidstaat van herkomst", "Intrastat, standaard gewest",
  "Intrastat, goederencode", "Intrastat, gewicht per eenheid", "Intrastat, land van oorsprong",
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