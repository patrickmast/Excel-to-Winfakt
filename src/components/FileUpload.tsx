import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { useToast } from './ui/use-toast';

interface FileUploadProps {
  onDataLoaded: (columns: string[], data: any[]) => void;
}

const FileUpload = ({ onDataLoaded }: FileUploadProps) => {
  const { toast } = useToast();

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        if (file.name.toLowerCase().endsWith('.csv')) {
          Papa.parse(e.target?.result as string, {
            header: true,
            complete: (results) => {
              const columns = Object.keys(results.data[0]);
              onDataLoaded(columns, results.data);
            },
            error: () => {
              toast({
                title: "Error",
                description: "Failed to parse CSV file",
                variant: "destructive",
              });
            }
          });
        } else {
          const workbook = XLSX.read(e.target?.result, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json(firstSheet);
          const columns = Object.keys(data[0]);
          onDataLoaded(columns, data);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to process file",
          variant: "destructive",
        });
      }
    };

    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to read file",
        variant: "destructive",
      });
    };

    reader.readAsBinaryString(file);
  }, [onDataLoaded, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback((acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        processFile(file);
      }
    }, [processFile]),
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-12
        flex flex-col items-center justify-center
        cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
      `}
    >
      <input {...getInputProps()} />
      <div className="text-center">
        <p className="text-xl font-medium text-gray-700 mb-2">
          {isDragActive ? 'Drop your file here' : 'Drag & drop your Excel or CSV file'}
        </p>
        <p className="text-sm text-gray-500">
          or click to select a file
        </p>
      </div>
    </div>
  );
};

export default FileUpload;