import Papa from 'papaparse';
import { safeBlobDownload } from './blobUtils';

export const addTimestampToFilename = (filename: string | undefined): string => {
  if (!filename) {
    return `export-${Math.floor(Date.now() / 1000)}.CSV`;
  }
  // Remove extension first
  const baseName = filename.replace(/\.[^/.]+$/, '');
  // Remove '_export' from the base name if present
  const cleanBaseName = baseName.replace(/_export$/, '');
  const extension = '.CSV';
  const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
  return `${cleanBaseName}-${timestamp}${extension}`;
};

export const isRowEmpty = (row: Record<string, any> | any[]): boolean => {
  // Handle array format (for array-based rows)
  if (Array.isArray(row)) {
    return !row.some(cell => {
      if (cell === null || cell === undefined) return false;
      if (typeof cell === 'string') return cell.trim().length > 0;
      return true;
    });
  }
  
  // Handle object format (for key-value rows)
  const exportedValues = Object.entries(row)
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([_, value]) => value);
  
  const isEmpty = exportedValues.length === 0 || !exportedValues.some(value => String(value).trim() !== '');
  return isEmpty;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  // Show decimals only for MB and GB (index 2 and 3)
  return i < 2 
    ? `${Math.round(value)} ${sizes[i]}`
    : `${value.toFixed(1)} ${sizes[i]}`;
};

export const downloadCSV = async (
  data: any[], 
  filename: string, 
  headers?: string[], 
  onError?: (error: Error) => void
) => {
  // Configure Papa Parse for unparse
  const config = {
    quotes: false, // Never use quotes around fields
    delimiter: ";",
    escapeChar: "\\",
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
  };

  try {
    // Support both formats: array of objects (default) or separate headers/data
    const csv = headers 
      ? Papa.unparse({ fields: headers, data })
      : Papa.unparse(data, config);

    // Handle IE/Edge legacy
    if ((navigator as any).msSaveBlob) {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      (navigator as any).msSaveBlob(blob, addTimestampToFilename(filename));
      return;
    }
    
    // Use safe blob download utility
    await safeBlobDownload(csv, {
      filename: addTimestampToFilename(filename),
      mimeType: 'text/csv;charset=utf-8;'
    });
    
  } catch (error) {
    if (onError) {
      onError(error as Error);
    } else {
      throw error;
    }
  }
};

