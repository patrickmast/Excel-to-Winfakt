import { useRef } from 'react';
import { VanillaMenu } from './vanilla/react/VanillaMenu';

interface FileUploadProps {
  onDataLoaded: (columns: string[], data: any[]) => void;
  currentMapping?: Record<string, string>;
  children?: React.ReactNode;
}

const FileUpload = ({ onDataLoaded, currentMapping, children }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
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
    onDataLoaded(headers, data);
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