import { useCallback, ReactNode } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { useToast } from '../hooks/use-toast';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onDataLoaded: (columns: string[], data: any[]) => void;
  children?: ReactNode;
}

const FileUpload = ({ onDataLoaded, children }: FileUploadProps) => {
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
            toast({
              title: "File loaded successfully",
              description: `Found ${columns.length} columns and ${jsonData.length} rows`,
            });
          }
        } else if (extension === 'csv') {
          const text = event.target?.result as string;
          Papa.parse(text, {
            header: true,
            complete: (results) => {
              const columns = results.meta.fields || [];
              onDataLoaded(columns, results.data);
              toast({
                title: "File loaded successfully",
                description: `Found ${columns.length} columns and ${results.data.length} rows`,
              });
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

  if (children) {
    return (
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {children}
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-600">
        {isDragActive
          ? "Drop the file here"
          : "Drag 'n' drop a file here, or click to select file"}
      </p>
      <p className="text-xs text-gray-500 mt-2">
        Supports Excel (.xlsx, .xls) and CSV files
      </p>
    </div>
  );
};

export default FileUpload;