import Papa from 'papaparse';

export const downloadCSV = (data: any[], filename: string) => {
  // Transform the data to handle quotes in string values without wrapping
  const escapedData = data.map(row => {
    const newRow: Record<string, any> = {};
    Object.entries(row).forEach(([key, value]) => {
      // Only handle quotes if the value is a string
      if (typeof value === 'string') {
        // Replace quotes with escaped quotes, without adding wrapping quotes
        newRow[key] = value.replace(/"/g, '\\"');
      } else {
        newRow[key] = value;
      }
    });
    return newRow;
  });
  
  // Create a custom stringify function that prevents any wrapping quotes
  const customStringify = (value: any) => {
    return value?.toString() || '';
  };
  
  const csv = Papa.unparse(escapedData, {
    delimiter: ';',
    quotes: false,
    escapeFormulae: false,
    transform: customStringify
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