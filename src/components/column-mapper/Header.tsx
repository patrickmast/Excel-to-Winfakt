import { useRef, useState } from 'react';
import { VanillaMenu } from '../vanilla/react/VanillaMenu';
import '@/components/vanilla/Menu.css';
import { VanillaCard } from '../vanilla/react/VanillaCard';
import { VanillaDialog } from '../vanilla/react/VanillaDialog';
import Papa from 'papaparse';
import { toast } from '@/components/ui/use-toast';

interface HeaderProps {
  activeColumnSet: 'artikelen' | 'klanten';
  onColumnSetChange: (value: 'artikelen' | 'klanten') => void;
  onDataLoaded: (columns: string[], data: any[]) => void;
  currentMapping: Record<string, string>;
}

const Header = ({
  activeColumnSet,
  onColumnSetChange,
  onDataLoaded,
  currentMapping
}: HeaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewContentRef = useRef<string>('');
  const [showPreview, setShowPreview] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 1) {
            const headers = results.data[0] as string[];
            const data = results.data.slice(1).map((row: unknown[]) => {
              const obj: Record<string, string> = {};
              headers.forEach((header: string, index: number) => {
                obj[header] = String(row[index] ?? '');
              });
              return obj;
            });
            onDataLoaded(headers, data);
          } else {
            toast({
              title: "Error",
              description: "The CSV file appears to be empty or missing headers.",
              variant: "destructive"
            });
          }
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          toast({
            title: "Error",
            description: "Failed to parse CSV file. Please check the file format.",
            variant: "destructive"
          });
        }
      });
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      // For Excel files, we'll need to use a library like xlsx
      import('xlsx').then((XLSX) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

            if (rawData && rawData.length > 1) {
              const headers = rawData[0].map(String);
              const jsonData = rawData.slice(1).map(row => {
                const obj: Record<string, string> = {};
                headers.forEach((header: string, index: number) => {
                  obj[header] = String(row[index] ?? '');
                });
                return obj;
              });
              onDataLoaded(headers, jsonData);
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
          }
        };
        reader.readAsArrayBuffer(file);
      }).catch(error => {
        console.error('Error loading xlsx library:', error);
        toast({
          title: "Error",
          description: "Failed to load Excel parser. Please try again.",
          variant: "destructive"
        });
      });
    } else {
      toast({
        title: "Error",
        description: "Please select a CSV or Excel file.",
        variant: "destructive"
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSelectFile = () => {
    fileInputRef.current?.click();
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
      />
      <VanillaMenu
        items={[
          {
            label: 'Select file',
            onClick: handleSelectFile,
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
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
            )
          },
          {
            label: 'Preview file',
            onClick: handlePreviewFile,
            disabled: !hasFileSelected,
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
        Source file
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