import { useCallback, ReactNode } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { useToast } from '../hooks/use-toast';
import { Upload } from 'lucide-react';

// Declare the global variable for TypeScript
declare global {
  interface Window {
    currentUploadedFile: File | null;
  }
}

// Initialize the global variable
window.currentUploadedFile = null;

interface FileUploadProps {
  onDataLoaded: (columns: string[], data: any[]) => void;
  children?: ReactNode;
  currentMapping?: Record<string, string>;
}

const FileUpload = ({ onDataLoaded, children, currentMapping }: FileUploadProps) => {
  const { toast } = useToast();

  const processColumns = (columns: string[]) => {
    return columns.map((col, index) => {
      if (!col || col.trim() === '') {
        const letter = String.fromCharCode(65 + index);
        return `Column ${letter}/${index + 1}`;
      }
      return col;
    });
  };

  const validateColumnsAgainstMapping = (columns: string[]) => {
    if (!currentMapping) return true;

    const requiredSourceColumns = new Set(
      Object.keys(currentMapping).map(key => key.split('_')[0])
    );

    const missingColumns = Array.from(requiredSourceColumns).filter(
      col => !columns.includes(col)
    );

    if (missingColumns.length > 0) {
      toast({
        title: "Incompatible file",
        description: `This file is not compatible with the current configuration. Missing columns: ${missingColumns.join(', ')}`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      window.currentUploadedFile = file;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const extension = file.name.split('.').pop()?.toLowerCase();
          if (extension === 'xlsx' || extension === 'xls') {
            await new Promise<void>((resolve) => setTimeout(async () => {
              const data = event.target?.result;
              const workbook = XLSX.read(data, { type: 'binary' });
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];

              // Only keeping the essential options that fixed the issue
              const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                defval: '',
                raw: false,
                header: 1
              });

              if (jsonData.length > 0) {
                const columns = jsonData[0] as string[];
                const data = jsonData.slice(1).map(row => {
                  const obj: Record<string, any> = {};
                  columns.forEach((col, index) => {
                    obj[col] = row[index] || '';
                  });
                  return obj;
                });

                if (validateColumnsAgainstMapping(columns)) {
                  onDataLoaded(columns, data);
                  toast({
                    title: "File loaded successfully",
                    description: `Found ${columns.length} columns and ${data.length} rows`,
                  });
                } else {
                  window.currentUploadedFile = null;
                }
              }
              resolve();
            }, 0));
          } else if (extension === 'csv') {
            // ... existing CSV handling code ...
          }
        } catch (error) {
          console.error('Error processing file:', error);
          toast({
            title: "Error",
            description: "Failed to process the file",
            variant: "destructive",
          });
        }
      };

      reader.readAsBinaryString(file);
    },
    [onDataLoaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: false,
    noClick: !!children // Disable click when using custom children
  });

  if (children) {
    return (
      <form
        data-upload-form
        {...getRootProps()}
        onClick={(e) => e.stopPropagation()}
      >
        <input {...getInputProps()} />
        {children}
      </form>
    );
  }

  return (
    <form
      data-upload-form
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-600">
        {isDragActive
          ? "Drop the file here"
          : "Drag 'n' drop a file here, or click to select a file"}
      </p>
      <p className="text-xs text-gray-500 mt-2">
        Supports Excel (.xlsx, .xls) and CSV files
      </p>
    </form>
  );
};

export default FileUpload;