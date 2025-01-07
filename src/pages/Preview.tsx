import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const Preview = () => {
  const [searchParams] = useSearchParams();
  const [content, setContent] = useState<string>('Loading...');
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);

  const createTableHTML = (data: any[]): string => {
    if (!data || data.length === 0) return '<p>No data available</p>';

    const headers = data[0];
    const rows = data.slice(1);

    return `
      <table class="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-100">
            ${headers.map((header: any) => `
              <th class="border border-gray-300 px-4 py-2 text-left">${header || ''}</th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row: any[]) => `
            <tr class="hover:bg-gray-50">
              ${row.map((cell) => `
                <td class="border border-gray-300 px-4 py-2">${cell || ''}</td>
              `).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fileId = searchParams.get('fileId');
        if (!fileId) {
          setContent('No file ID provided');
          return;
        }

        const response = await fetch(`/api/preview/${fileId}`);
        if (!response.ok) {
          setContent('File not found');
          return;
        }

        const blob = await response.blob();
        const file = new File([blob], searchParams.get('filename') || 'unknown', { type: blob.type });
        setFileInfo({
          name: file.name,
          size: file.size
        });

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const extension = file.name.split('.').pop()?.toLowerCase();
            if (extension === 'xlsx' || extension === 'xls') {
              const data = event.target?.result;
              const workbook = XLSX.read(data, { type: 'binary' });
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];
              const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
              setContent(createTableHTML(jsonData));
            } else if (extension === 'csv') {
              const text = event.target?.result as string;
              Papa.parse(text, {
                complete: (results) => {
                  setContent(createTableHTML(results.data));
                },
              });
            }
          } catch (error) {
            setContent('Error processing file');
          }
        };

        if (file.name.endsWith('.csv')) {
          reader.readAsText(file);
        } else {
          reader.readAsBinaryString(file);
        }
      } catch (error) {
        setContent('Error loading file');
      }
    };

    fetchData();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {fileInfo && (
          <div className="mb-4 text-gray-700">
            <strong>Filename:</strong> {fileInfo.name} ({(fileInfo.size / 1024).toFixed(2)} KB)
          </div>
        )}
        <hr className="border-t border-gray-200 mb-4" />
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
};

export default Preview;