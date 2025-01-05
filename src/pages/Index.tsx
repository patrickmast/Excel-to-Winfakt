import { useState } from 'react';
import FileUpload from '../components/FileUpload';
import ColumnMapper from '../components/ColumnMapper';
import { useToast } from '../components/ui/use-toast';
import { downloadCSV } from '../utils/csvUtils';

const Index = () => {
  const [sourceColumns, setSourceColumns] = useState<string[]>([]);
  const [sourceData, setSourceData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleFileData = (columns: string[], data: any[]) => {
    setSourceColumns(columns);
    setSourceData(data);
    toast({
      title: "File loaded successfully",
      description: `Found ${columns.length} columns and ${data.length} rows`,
    });
  };

  const handleMappingChange = (mapping: Record<string, string>) => {
    setColumnMapping(mapping);
    
    if (Object.keys(mapping).length === 0) {
      return;
    }

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">CSV/Excel Converter</h1>
        
        {sourceColumns.length === 0 ? (
          <FileUpload onDataLoaded={handleFileData} />
        ) : (
          <ColumnMapper 
            sourceColumns={sourceColumns}
            targetColumns={TARGET_COLUMNS}
            onMappingChange={handleMappingChange}
          />
        )}
      </div>
    </div>
  );
};

const TARGET_COLUMNS = [
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

export default Index;
