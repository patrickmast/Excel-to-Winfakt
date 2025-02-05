import Papa from 'papaparse';

const addTimestampToFilename = (filename: string): string => {
  // Remove extension first
  const baseName = filename.replace(/\.[^/.]+$/, '');
  const extension = '.CSV';
  const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
  return `${baseName}-${timestamp}${extension}`;
};

const isRowEmpty = (row: Record<string, any>): boolean => {
  return Object.values(row).every(value => 
    value === null || value === undefined || String(value).trim() === ''
  );
};

export const downloadCSV = (data: any[], filename: string) => {
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

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  const finalFilename = addTimestampToFilename(filename);

  if (navigator.hasOwnProperty('msSaveBlob')) {
    (navigator as any).msSaveBlob(blob, finalFilename);
  } else {
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', finalFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Generate and download the report
  const reportContent = [
    `CSV Export Report`,
    `----------------`,
    `Source file: ${filename}`,
    `Export timestamp: ${new Date().toISOString()}`,
    `Exported rows: ${filteredData.length}`,
    `Skipped rows: ${skippedRows.length}`,
    '',
    skippedRows.length > 0 
      ? `Skipped row numbers: ${skippedRows.join(', ')}`
      : 'No rows were skipped',
  ].join('\n');

  const reportFilename = finalFilename.replace(/\.CSV$/, '-report.txt');
  const reportBlob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
  
  const reportLink = document.createElement('a');
  if (navigator.hasOwnProperty('msSaveBlob')) {
    (navigator as any).msSaveBlob(reportBlob, reportFilename);
  } else {
    reportLink.href = URL.createObjectURL(reportBlob);
    reportLink.setAttribute('download', reportFilename);
    document.body.appendChild(reportLink);
    reportLink.click();
    document.body.removeChild(reportLink);
  }
};