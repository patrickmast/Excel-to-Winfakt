import Papa from 'papaparse';

export const addTimestampToFilename = (filename: string | undefined): string => {
  if (!filename) {
    return `export-${Math.floor(Date.now() / 1000)}.CSV`;
  }
  // Remove extension first
  const baseName = filename.replace(/\.[^/.]+$/, '');
  const extension = '.CSV';
  const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
  return `${baseName}-${timestamp}${extension}`;
};

export const isRowEmpty = (row: Record<string, any>): boolean => {
  return Object.values(row).every(value => 
    value === null || value === undefined || String(value).trim() === ''
  );
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

export const generateExportReport = (
  sourceFile: string,
  totalRows: number,
  exportedRows: number,
  skippedRows: number[],
  exportFile: string,
  sourceFileSize: number,
  exportFileSize: number,
  worksheetName?: string
): string => {
  const report = [
    'Export report',
    '=============\n',
    `Source file: ${sourceFile}`,
    `Source file size: ${formatFileSize(sourceFileSize)}`,
    worksheetName ? `Worksheet: ${worksheetName}` : null,
    `Total rows processed: ${totalRows}`,
    `Successfully exported rows: ${exportedRows}`,
    `Skipped empty rows: ${skippedRows.length}`,
    `CSV file: ${exportFile}`,
    `CSV file size: ${formatFileSize(exportFileSize)}`,
    ...(skippedRows.length > 0 ? [
      '',
      'Skipped rows:',
      '-------------',
      `Rows: ${skippedRows.join(', ')}`
    ] : [])
  ].filter(line => line !== null).join('\n');

  return report;
};

export const downloadCSV = (
  data: any[],
  filename: string,
  sourceFilename?: string,
  worksheetName?: string,
  sourceFileSize?: number
) => {
  const skippedRows: number[] = [];
  
  // Find the last non-empty row index
  let lastNonEmptyRowIndex = data.length - 1;
  while (lastNonEmptyRowIndex >= 0 && isRowEmpty(data[lastNonEmptyRowIndex])) {
    lastNonEmptyRowIndex--;
  }

  // Filter data and track skipped rows before the last non-empty row
  const filteredData = data.filter((row, index) => {
    if (isRowEmpty(row)) {
      // Only track skipped rows that appear before the last non-empty row
      if (index <= lastNonEmptyRowIndex) {
        skippedRows.push(index + 2); // Add 2 to match Excel row numbers (header is row 1)
      }
      return false;
    }
    return true;
  });

  // Transform the filtered data to handle quotes and numeric-like values correctly
  const escapedData = filteredData.map(row => {
    const newRow: Record<string, any> = {};
    Object.entries(row).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // Trim any leading/trailing spaces while preserving internal spaces
        const trimmedValue = value.trim();
        
        // Check if the value is numeric-like (contains only numbers and spaces)
        const isNumericLike = /^[\d\s]+$/.test(trimmedValue);
        
        if (isNumericLike) {
          // For numeric-like values, preserve spaces but don't add quotes
          newRow[key] = trimmedValue;
        } else {
          // For other strings, escape quotes if present
          newRow[key] = value.replace(/"/g, '\\"');
        }
      } else {
        newRow[key] = value;
      }
    });
    return newRow;
  });

  // Generate the export filename with timestamp
  const exportFilename = addTimestampToFilename(filename);
  
  // Create the CSV content first to get accurate file size
  const csv = Papa.unparse(escapedData, {
    delimiter: ';',
    quotes: false, // Don't automatically add quotes
    escapeFormulae: false,
    transform: (value) => {
      if (value === null || value === undefined) return '';
      // Ensure we don't add quotes to numeric-like values
      const strValue = String(value);
      return strValue;
    }
  });

  // Calculate file sizes
  const actualSourceFileSize = sourceFileSize || 0;
  const exportFileSize = new Blob([csv]).size;
  
  // Generate the report
  const report = [
    'Export report',
    '=============\n',
    `Source file: ${sourceFilename || 'Unknown source file'}`,
    `Source file size: ${formatFileSize(actualSourceFileSize)}`,
    `Total rows processed: ${data.length}`,
    `Successfully exported rows: ${filteredData.length}`,
    `Skipped empty rows: ${skippedRows.length}`,
    `CSV file: ${exportFilename}`,
    `CSV file size: ${formatFileSize(exportFileSize)}`,
    ...(worksheetName ? [
      `Worksheet: ${worksheetName}`
    ] : []),
    ...(skippedRows.length > 0 ? [
      `\nSkipped rows: ${skippedRows.join(', ')}`
    ] : [])
  ].filter(line => line !== null).join('\n');

  // Create and download the report file
  const reportBlob = new Blob([report], { type: 'text/plain' });
  const reportUrl = window.URL.createObjectURL(reportBlob);
  const reportLink = document.createElement('a');
  reportLink.href = reportUrl;
  reportLink.download = exportFilename.replace('.CSV', '-report.txt');
  reportLink.click();
  window.URL.revokeObjectURL(reportUrl);

  // Create and download the CSV file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (navigator.hasOwnProperty('msSaveBlob')) {
    (navigator as any).msSaveBlob(blob, exportFilename);
  } else {
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', exportFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};