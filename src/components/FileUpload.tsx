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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Store the current file globally
    window.currentUploadedFile = file;

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
            const columns = processColumns(Object.keys(jsonData[0]));
            
            if (validateColumnsAgainstMapping(columns)) {
              onDataLoaded(columns, jsonData);
              toast({
                title: "File loaded successfully",
                description: `Found ${columns.length} columns and ${jsonData.length} rows`,
              });
            } else {
              window.currentUploadedFile = null;
            }
          }
        } else if (extension === 'csv') {
          const text = event.target?.result as string;
          Papa.parse(text, {
            header: true,
            complete: (results) => {
              const columns = processColumns(results.meta.fields || []);
              
              if (validateColumnsAgainstMapping(columns)) {
                onDataLoaded(columns, results.data);
                toast({
                  title: "File loaded successfully",
                  description: `Found ${columns.length} columns and ${results.data.length} rows`,
                });
              } else {
                window.currentUploadedFile = null;
              }
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
  }, [onDataLoaded, toast, currentMapping]);

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