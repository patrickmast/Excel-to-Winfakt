import { useRef } from 'react';
import { VanillaMenu } from './vanilla/react/VanillaMenu';
import { toast } from './toast'; // Assuming toast is imported from a separate module

interface FileUploadProps {
  onDataLoaded: (columns: string[], data: any[], filename: string, currentMapping?: Record<string, string>, fileSize?: number) => void;
  currentMapping?: Record<string, string>;
  children?: React.ReactNode;
}

const FileUpload = ({ onDataLoaded, currentMapping, children }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // CRITICAL: This validation must be maintained across all refactors
    // Empty files have historically caused bugs when this check was lost
    if (!file || file.size === 0) {
      console.error('Invalid file: File is empty or does not exist');
      toast({
        title: "Invalid File",
        description: "The selected file is empty. Please choose a valid file.",
        variant: "destructive"
      });
      return;
    }
    const text = await file.text();
    const rows = text.split('\n').map(row => row.split(','));
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    onDataLoaded(headers, data, file.name, undefined, file.size); // Reverted to correct parameter order
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      {children}
    </div>
  );
};

export default FileUpload;