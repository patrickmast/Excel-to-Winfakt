import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { FileUp } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface FileUploadProps {
  onDataLoaded: (columns: string[], data: any[]) => void;
}

const FileUpload = ({ onDataLoaded }: FileUploadProps) => {
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (extension === 'xlsx' || extension === 'xls') {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          if (jsonData.length > 0) {
            const columns = Object.keys(jsonData[0]);
            onDataLoaded(columns, jsonData);
          }
        } else if (extension === 'csv') {
          const text = event.target?.result as string;
          Papa.parse(text, {
            header: true,
            complete: (results) => {
              const columns = results.meta.fields || [];
              onDataLoaded(columns, results.data);
            },
          });
        }
      } catch (error) {
        toast({
          title: "Error processing file",
          description: "Please make sure the file is a valid Excel or CSV file",
          variant: "destructive",
        });
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  }, [onDataLoaded, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: false
  });

  const handleTestData = () => {
    const testData = `sku;name;sell-price-1;buy-netto-price;buy-catalog-price;name.nl-be;vat;supplier-code;brand;recupel-tax;bar-code;main-group;ev-num-1;ev-num-2;ev-num-3;ev-text-1;ev-text-2;ev-text-3;ev-text-4;ev-text-5;ev-text-6;ev-text-7;ev-text-8;ev-bool-2;ev-bool-3;ev-bool-4;stock-qty-location-1;compute-stock;active
689;Solis Smart heater 689 This line should be very very very very long! is it?;99;74.55;74.55;Solis Smart heater 689;21;689;Solis;;7611210971030;All / Klein electro / Luchtbehandeling;0.05;0;0;36723;9398;;Voorraadproduct;Klein;All / Klein electro / Luchtbehandeling;All / Klein electro / Luchtbehandeling / Verwarming;639;false;false;true;0;true;true`;

    Papa.parse(testData, {
      header: true,
      delimiter: ";",
      complete: (results) => {
        const columns = results.meta.fields || [];
        onDataLoaded(columns, results.data);
        toast({
          title: "Test data loaded",
          description: "Sample data has been loaded successfully",
        });
      }
    });
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}
        >
          <input {...getInputProps()} />
          <FileUp className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive
              ? "Drop the file here"
              : "Drag 'n' drop a file here, or click to select a file"}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Supports Excel (.xlsx, .xls) and CSV files
          </p>
        </div>
        <div className="mt-4 flex justify-center">
          <Button 
            variant="outline"
            onClick={handleTestData}
          >
            Test data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;