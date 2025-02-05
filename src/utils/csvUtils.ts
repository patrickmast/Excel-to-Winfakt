import Papa from 'papaparse';

const addTimestampToFilename = (filename: string): string => {
  // Remove extension first
  const baseName = filename.replace(/\.[^/.]+$/, '');
  const extension = '.CSV';
  const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
  return `${baseName}-${timestamp}${extension}`;
};

export const downloadCSV = (data: any[], filename: string) => {
  // Transform the data to handle quotes and numeric-like values correctly
  const escapedData = data.map(row => {
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
};