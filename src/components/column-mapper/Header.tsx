import { useToast } from "@/components/ui/use-toast";
import { VanillaDialog } from "@/components/vanilla/react/VanillaDialog";
import React, { useState } from 'react';

interface HeaderProps {
  activeColumnSet: string;
  onColumnSetChange: (columnSet: string) => void;
  onDataLoaded: (columns: string[], data: any[], sourceFilename: string) => void;
  currentMapping: Record<string, string>;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
  onFileSelect?: (file: File) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeColumnSet,
  onColumnSetChange,
  onDataLoaded,
  currentMapping,
  isLoading,
  onLoadingChange,
  onFileSelect
}) => {
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
    setFileInputKey(Date.now()); // Reset file input
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white shadow">
      <h2 className="text-lg font-semibold">Column Mapper</h2>
      <div className="flex items-center">
        <input
          key={fileInputKey}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded">
          Upload File
        </label>
        <button
          onClick={() => onColumnSetChange(activeColumnSet === 'artikelen' ? 'klanten' : 'artikelen')}
          className="ml-4 bg-green-500 text-white px-4 py-2 rounded"
        >
          Switch Column Set
        </button>
      </div>
    </div>
  );
};
