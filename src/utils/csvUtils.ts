import Papa from 'papaparse';

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

export const isRowEmpty = (row: Record<string, any>): boolean => {
  // Only check values that will be in the exported CSV (those that are not null/undefined)
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

export const downloadCSV = (data: any[], filename: string) => {
  // Configure Papa Parse for unparse
  const config = {
    quotes: true, // Force quotes around all fields
    quoteChar: '"',
    escapeChar: '"',
    delimiter: ",",
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
  };

  try {
    const csv = Papa.unparse(data, config);

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', addTimestampToFilename(filename));
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    throw error;
  }
};

export function isEmptyRow(row: any[]): boolean {
  const hasValues = row.some(cell => {
    if (cell === null || cell === undefined) return false;
    if (typeof cell === 'string') return cell.trim().length > 0;
    return true;
  });
  return !hasValues;
}

export async function downloadCSV(
  data: any[],
  filename: string,
  headers: string[],
  onError?: (error: Error) => void
): Promise<void> {
  try {
    const csv = Papa.unparse({
      fields: headers,
      data: data
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, filename);
      return;
    }

    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    if (onError) {
      onError(error as Error);
    } else {
      throw error;
    }
  }
}