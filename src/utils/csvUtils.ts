import Papa from 'papaparse';

const addTimestampToFilename = (filename: string): string => {
  // Remove extension first
  const baseName = filename.replace(/\.[^/.]+$/, '');
  const extension = '.CSV';
  const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
  return `${baseName}-${timestamp}${extension}`;
};

export const downloadCSV = (data: any[], filename: string) => {
  // Transform the data to handle quotes without wrapping
  const escapedData = data.map(row => {
    const newRow: Record<string, any> = {};
    Object.entries(row).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // Replace quotes with escaped quotes, no wrapping
        newRow[key] = value.replace(/"/g, '\\"');
      } else {
        newRow[key] = value;
      }
    });
    return newRow;
  });

  const csv = Papa.unparse(escapedData, {
    delimiter: ';',
    quotes: false,
    escapeFormulae: false,
    transform: (value) => value === null || value === undefined ? '' : String(value)
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