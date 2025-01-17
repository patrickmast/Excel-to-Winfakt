import { useState, useEffect } from 'react';
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

const Index = () => {
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [sourceData, setSourceData] = useState<any[]>([]);
  const [activeColumnSet, setActiveColumnSet] = useState<'artikelen' | 'klanten'>('artikelen');
  const { toast } = useToast();
  const { saveConfiguration, isSaving } = useConfiguration();
  const [currentConfigId, setCurrentConfigId] = useState<string | null>(null);
  const [showSavedDialog, setShowSavedDialog] = useState(false);
  const [savedConfigUrl, setSavedConfigUrl] = useState('');
  const [searchParams] = useSearchParams();
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [sourceFileInfo, setSourceFileInfo] = useState<{ filename: string; rowCount: number; worksheetName?: string } | null>(null);

  useEffect(() => {
    const loadSavedConfiguration = async () => {
      const id = searchParams.get('id');
      if (!id) return;

      try {
        const { data: config, error } = await supabase
          .from('shared_configurations')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!config) return;

        // Set the configuration
        setCurrentConfigId(config.id);
        const settings = config.settings as unknown as ConfigurationSettings;
        if (settings?.mapping) {
          setColumnMapping(settings.mapping);
        }

        toast({
          title: "Configuration loaded",
          description: "The saved configuration has been loaded successfully. Please select your source file.",
        });
      } catch (error) {
        console.error('Error loading configuration:', error);
        toast({
          title: "Error",
          description: "Failed to load the saved configuration",
          variant: "destructive",
        });
      }
    };

    loadSavedConfiguration();
  }, [searchParams, toast]);

  const handleMappingChange = (mapping: Record<string, string>) => {
    setColumnMapping(mapping);
  };

  const handleSaveConfiguration = async (isNewConfig: boolean = true) => {
    const result = await saveConfiguration(
      columnMapping,
      {},
      isNewConfig
    );

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
          isSaving={isSaving}
        />

        <ColumnMapper
          onMappingChange={handleMappingChange}
          onExport={(mapping) => {
            const mappedData = sourceData.map(row => {
              const newRow: Record<string, any> = {};
              Object.entries(mapping).forEach(([source, target]) => {
                if (source && target) {
                  newRow[target] = row[source];
                }
              });
              return newRow;
            });
            downloadCSV(mappedData, 'converted.csv');
            toast({
              title: "Export successful",
              description: "Your file has been converted and downloaded",
            });
          }}
          onDataLoaded={setSourceData}
          targetColumns={activeColumnSet === 'artikelen' ? ARTIKEL_COLUMNS : KLANTEN_COLUMNS}
          activeColumnSet={activeColumnSet}
          onColumnSetChange={setActiveColumnSet}
          onSourceFileChange={setSourceFileInfo}
        />
      </div>
    </div>
  );
};

const ARTIKEL_COLUMNS = [
  "Actief?", "Stock verwerken?", "Artikelnummer", "Omschrijving", "Omschrijving NL",
  "Omschrijving GB", "Omschrijving DE", "Omschrijving FR", "Omschrijving TR",
  "BTW-percentage", "Netto verkoopprijs 1", "Netto verkoopprijs 2", "Netto verkoopprijs 3",
  "Netto verkoopprijs 4", "Netto verkoopprijs 5", "Netto verkoopprijs 6", "Netto verkoopprijs 7",
  "Netto verkoopprijs 8", "Netto verkoopprijs 9", "Netto verkoopprijs 10", "Netto aankoopprijs",
  "Catalogusprijs", "Artikelnummer fabrikant", "Artikelnummer leverancier", "Leveranciersnummer",
  "merk", "Recupel", "Auvibel", "Bebat", "Reprobel", "Leeggoed", "Accijnzen", "Ecoboni",
  "Barcode", "Rekeningnummer",
  ...Array.from({length: 20}, (_, i) => `Numeriek extra veld ${i + 1}`),
  ...Array.from({length: 20}, (_, i) => `Alfanumeriek extra veld ${i + 1}`),
  ...Array.from({length: 20}, (_, i) => `Logisch extra veld ${i + 1}`),
  ...Array.from({length: 9}, (_, i) => `Voorraad locatie ${i + 1}`),
  ...Array.from({length: 9}, (_, i) => `Voorraad locatie ${i + 1} toevoegen`),
  "Is beginstock", "Hoofdgroep", "Subgroep", "Eenheid", "Korting uitgeschakeld",
  "Gemarkeerd voor label printer", "Aantal 2", "intrastat-excnt", "intrastat-extreg",
  "intrastat-extgo", "intrastat-exweight", "intrastat-excntori"
];

const KLANTEN_COLUMNS = [
  "nr", "company-name", "firstname", "lastname", "address-line-1", "postal", "city",
  "country-code", "email", "lng", "info", "phone", "mobile", "vat", "payment-days",
  "payment-end-month",
  ...Array.from({length: 20}, (_, i) => `ev-num-${i + 1}`),
  ...Array.from({length: 20}, (_, i) => `ev-text-${i + 1}`),
  ...Array.from({length: 20}, (_, i) => `ev-bool-${i + 1}`)
];

export default Index;