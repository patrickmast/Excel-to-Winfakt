import { useRef, useState } from 'react';
import { VanillaMenu } from '../vanilla/react/VanillaMenu';
import '@/components/vanilla/Menu.css';
import { VanillaCard } from '../vanilla/react/VanillaCard';
import { VanillaDialog } from '../vanilla/react/VanillaDialog';
import Papa from 'papaparse';
import { toast } from '@/components/ui/use-toast';
import { useToast } from '@/components/ui/use-toast';

// Add XLSX to window type
declare global {
  interface Window {
    XLSX: any;
  }
}

// @ts-ignore
const XLSX = window.XLSX;

// Add a function to check if XLSX is loaded
const isXLSXLoaded = () => {
  return typeof window.XLSX !== 'undefined';
};

interface HeaderProps {
  activeColumnSet: string;
  onColumnSetChange: (columnSet: string) => void;
  onDataLoaded: (headers: string[], data: any[], sourceFilename: string) => void;
  currentMapping?: Record<string, string>;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
}

const Header = ({
  activeColumnSet,
  onColumnSetChange,
  onDataLoaded,
  currentMapping,
  isLoading,
  onLoadingChange
}: HeaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewContentRef = useRef<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    console.log('handleFileSelect started');
    console.log('File name:', file.name);
    console.log('File type:', file.type);
    console.log('Ends with xlsx:', file.name.endsWith('.xlsx'));
    console.log('Ends with xls:', file.name.endsWith('.xls'));

    onLoadingChange(true);

    const lowerFileName = file.name.toLowerCase();
    if (lowerFileName.endsWith('.csv')) {
      console.log('Processing as CSV file');
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            if (results.data && results.data.length > 1) {
              const headers = results.data[0] as string[];
              const data = results.data.slice(1).map((row: unknown[]) => {
                const obj: Record<string, string> = {};
                headers.forEach((header: string, index: number) => {
                  obj[header] = String(row[index] ?? '');
                });
                return obj;
              });
              onDataLoaded(headers, data, file.name);
            } else {
              toast({
                title: "Error",
                description: "The CSV file appears to be empty or missing headers.",
                variant: "destructive"
              });
            }
          } finally {
            onLoadingChange(false);
          }
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          toast({
            title: "Error",
            description: "Failed to parse CSV file. Please check the file format.",
            variant: "destructive"
          });
          onLoadingChange(false);
        }
      });
    } else if (lowerFileName.endsWith('.xlsx') || lowerFileName.endsWith('.xls')) {
      console.log('Starting Excel file load process');
      if (!isXLSXLoaded()) {
        console.log('XLSX not loaded, waiting...');
        toast({
          title: "Loading Excel Support",
          description: "Please wait while Excel support is being loaded...",
        });

        // Wait for a short time to see if XLSX loads
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (!isXLSXLoaded()) {
          console.log('XLSX still not loaded after waiting');
          toast({
            title: "Error",
            description: "Excel support could not be loaded. Please try refreshing the page or use CSV files instead.",
            variant: "destructive"
          });
          onLoadingChange(false);
          return;
        }
      }
      console.log('XLSX loaded successfully');

      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            console.log('File read successfully, attempting to parse');
            const data = e.target?.result;
            console.log('Data type:', typeof data);
            const workbook = XLSX.read(data, { type: 'array' });
            console.log('Workbook loaded:', workbook.SheetNames);
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            console.log('Worksheet loaded');
            const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
            console.log('Raw data loaded:', rawData.length, 'rows');

            if (rawData && rawData.length > 1) {
              const headers = rawData[0].map(String);
              const jsonData = rawData.slice(1).map(row => {
                const obj: Record<string, string> = {};
                headers.forEach((header: string, index: number) => {
                  obj[header] = String(row[index] ?? '');
                });
                return obj;
              });
              onDataLoaded(headers, jsonData, file.name);
            } else {
              toast({
                title: "Error",
                description: "The Excel file appears to be empty or missing headers.",
                variant: "destructive"
              });
            }
          } catch (error) {
            console.error('Error parsing Excel:', error);
            toast({
              title: "Error",
              description: "Failed to parse Excel file. Please check the file format.",
              variant: "destructive"
            });
          } finally {
            onLoadingChange(false);
          }
        };
        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error('Error loading Excel file:', error);
        toast({
          title: "Error",
          description: "Failed to load Excel file. Please try again.",
          variant: "destructive"
        });
        onLoadingChange(false);
      }
    } else {
      toast({
        title: "Error",
        description: "Please select a CSV or Excel file.",
        variant: "destructive"
      });
      onLoadingChange(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleFileChange triggered');
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.type);
      handleFileSelect(file);
    }
  };

  const handleSelectFile = () => {
    console.log('handleSelectFile triggered');
    if (fileInputRef.current) {
      console.log('File input found, clicking...');
      fileInputRef.current.click();
    } else {
      console.log('File input ref is null');
    }
  };

  const handlePreviewFile = () => {
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewContentRef.current = e.target?.result as string;
        setShowPreview(true);
      };
      reader.readAsText(file);
    }
  };

  const hasFileSelected = fileInputRef.current?.files?.length > 0;

  return (
    <div className="flex items-center justify-between">
      <span>Source file columns</span>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        data-testid="file-input"
      />
      <VanillaMenu
        items={[
          {
            label: isLoading ? 'Loading...' : 'Select file',
            onClick: isLoading ? undefined : handleSelectFile,
            disabled: isLoading,
            icon: isLoading ? (
              <svg
                className="animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
            )
          },
          {
            label: 'Preview file',
            onClick: handlePreviewFile,
            disabled: !hasFileSelected || isLoading,
            icon: (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )
          }
        ]}
      >
        {isLoading ? 'Loading...' : 'Source file'}
      </VanillaMenu>

      <VanillaDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        title="File Preview"
      >
        <pre style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          maxHeight: '60vh',
          overflow: 'auto',
          padding: '1rem',
          backgroundColor: '#f9fafb',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          lineHeight: '1.5'
        }}>
          {previewContentRef.current}
        </pre>
      </VanillaDialog>
    </div>
  );
};

export default Header;