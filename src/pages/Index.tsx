import { useState } from 'react';
import ColumnMapper from '../components/ColumnMapper';
import { useToast } from '../components/ui/use-toast';
import { downloadCSV } from '../utils/csvUtils';
import { Menu, Settings, Info } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

const Index = () => {
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [sourceData, setSourceData] = useState<any[]>([]);
  const [activeColumnSet, setActiveColumnSet] = useState<'artikelen' | 'klanten'>('artikelen');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { toast } = useToast();

  const handleMappingChange = (mapping: Record<string, string>) => {
    setColumnMapping(mapping);
  };

  const handleExport = (mapping: Record<string, string>) => {
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
  };

  const showVersionInfo = () => {
    toast({
      title: "Version Info",
      description: "CSV Transformer v1.0.0",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CSV/Excel Converter</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={showVersionInfo}>
                <Info className="mr-2 h-4 w-4" />
                <span>Info</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <ColumnMapper 
          onMappingChange={handleMappingChange}
          onExport={handleExport}
          onDataLoaded={setSourceData}
          targetColumns={activeColumnSet === 'artikelen' ? ARTIKEL_COLUMNS : KLANTEN_COLUMNS}
          activeColumnSet={activeColumnSet}
          onColumnSetChange={setActiveColumnSet}
        />

        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
            </DialogHeader>
            {/* Settings content will go here */}
          </DialogContent>
        </Dialog>
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