import Papa from 'papaparse';

export const downloadCSV = (data: any[], filename: string) => {
  const csv = Papa.unparse(data, {
    delimiter: ';'
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