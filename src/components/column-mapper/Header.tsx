import React, { useState, useRef } from 'react';
import { VanillaMenu } from '@/components/vanilla/react/VanillaMenu';
import { toast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import './WorksheetSelector.css';

// Add XLSX to window type
declare global {
  interface Window {
    XLSX: any;
    currentUploadedFile?: File;
  }
}

// @ts-ignore
const XLSX = window.XLSX;

// Add a function to check if XLSX is loaded
const isXLSXLoaded = () => {
  return typeof window.XLSX !== 'undefined';
};

interface HeaderProps {
  onFileSelect: (file: File) => void;
  activeColumnSet: string;
  onColumnSetChange: (columnSet: string) => void;
  onDataLoaded: (headers: string[], data: any[], sourceFilename: string) => void;
  currentMapping?: Record<string, string>;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
}

export function Header({ onFileSelect, onColumnSetChange, onDataLoaded, currentMapping, isLoading, onLoadingChange }: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewContentRef = useRef<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [showSheetSelector, setShowSheetSelector] = useState(false);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [currentWorkbook, setCurrentWorkbook] = useState<any>(null);
  const [currentWorksheet, setCurrentWorksheet] = useState<string | null>(null);
  const { toast } = useToast();

  const processExcelWorksheet = (workbook: any, sheetName: string) => {
    try {
      const worksheet = workbook.Sheets[sheetName];
      console.log('Processing worksheet:', sheetName);
      setCurrentWorksheet(sheetName);
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
        onDataLoaded(headers, jsonData, currentWorkbook.fileName);
      } else {
        toast({
          title: "Error",
          description: "The selected worksheet appears to be empty or missing headers.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error processing worksheet:', error);
      toast({
        title: "Error",
        description: "Failed to process the selected worksheet.",
        variant: "destructive"
      });
    } finally {
      onLoadingChange(false);
      setShowSheetSelector(false);
    }
  };

  const handleSheetSelect = (sheetName: string) => {
    if (currentWorkbook) {
      processExcelWorksheet(currentWorkbook, sheetName);
    }
  };

  const handleFileSelect = async (file: File) => {
    console.log('handleFileSelect started');
    console.log('File name:', file.name);
    console.log('File type:', file.type);

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
            console.log('Number of sheets:', workbook.SheetNames.length);

            workbook.fileName = file.name;
            setCurrentWorkbook(workbook);

            if (workbook.SheetNames.length > 1) {
              console.log('Multiple sheets found:', workbook.SheetNames);
              const sheets = [...workbook.SheetNames];
              console.log('Setting available sheets:', sheets);
              setAvailableSheets(sheets);
              setShowSheetSelector(true);
              console.log('Dialog should be shown now, showSheetSelector:', true);
            } else {
              console.log('Single sheet found, processing directly');
              const firstSheet = workbook.SheetNames[0];
              setCurrentWorksheet(firstSheet);
              processExcelWorksheet(workbook, firstSheet);
            }
          } catch (error) {
            console.error('Error parsing Excel:', error);
            toast({
              title: "Error",
              description: "Failed to parse Excel file. Please check the file format.",
              variant: "destructive"
            });
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
    <header className="header">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv,.xlsx,.xls"
        style={{ display: 'none' }}
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
            label: 'Select worksheet',
            onClick: () => setShowSheetSelector(true),
            disabled: !currentWorkbook || currentWorkbook.SheetNames.length <= 1,
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
                <path d="M3 6h18" />
                <path d="M3 12h18" />
                <path d="M3 18h18" />
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

      {showSheetSelector && (
        <div className="worksheet-selector-overlay" onClick={() => setShowSheetSelector(false)}>
          <div className="worksheet-selector-dialog" onClick={e => e.stopPropagation()}>
            <h3 className="worksheet-selector-title">
              Select Worksheet
            </h3>
            <p className="worksheet-selector-description">
              This Excel file contains {availableSheets.length} worksheets. Please select which one you'd like to use:
            </p>
            <div className="worksheet-selector-list">
              {availableSheets.map((sheetName) => (
                <button
                  key={sheetName}
                  type="button"
                  onClick={() => handleSheetSelect(sheetName)}
                  className={`worksheet-button ${currentWorksheet === sheetName ? 'selected' : ''}`}
                >
                  <div className="worksheet-button-icon">
                    {currentWorksheet === sheetName ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : null}
                  </div>
                  <span className="worksheet-button-text">{sheetName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
