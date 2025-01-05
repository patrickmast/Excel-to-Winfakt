import Papa from 'papaparse';

export const downloadCSV = (data: any[], filename: string) => {
  // Transform the data to escape quotes in all string values
  const escapedData = data.map(row => {
    const newRow: Record<string, any> = {};
    Object.entries(row).forEach(([key, value]) => {
      // Only escape if the value is a string
      if (typeof value === 'string') {
        // Escape quotes with backslash without wrapping the string in quotes
        newRow[key] = value.replace(/"/g, '\\"');
      } else {
        newRow[key] = value;
      }
    });
    return newRow;
  });
  
  const csv = Papa.unparse(escapedData, {
    delimiter: ';',
    quotes: false, // This ensures Papa doesn't wrap fields in quotes
    escapeFormulae: false // Prevent escaping of = signs
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  // Check if the browser supports the msSaveBlob method (IE & Edge Legacy)
  if (navigator.hasOwnProperty('msSaveBlob')) {
    (navigator as any).msSaveBlob(blob, filename);
  } else {
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};