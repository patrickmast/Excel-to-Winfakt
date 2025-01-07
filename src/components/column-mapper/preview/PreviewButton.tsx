import { Eye } from 'lucide-react';
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

interface PreviewButtonProps {
  hasFile: boolean;
}

const PreviewButton = ({ hasFile }: PreviewButtonProps) => {
  const { toast } = useToast();

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

  const openPreviewWindow = (file: File, tableContent: string) => {
    const previewContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>File Preview - ${file.name}</title>
          <link rel="icon" href="https://www.winfakt.be/assets/ico/favicon.ico" />
          <meta property="og:image" content="https://files.taxi/patrick/ufadZsPEjfAAKF2xsgOg.jpeg" />
          <style>
            body { font-family: Arial, sans-serif; margin: 2rem; }
            .file-info { margin-bottom: 2rem; }
            .file-content { white-space: pre-wrap; }
            table { border-collapse: collapse; width: 100%; margin-top: 1rem; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            tr:hover { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <div class="file-info">
            <h2>File Information</h2>
            <p><strong>Name:</strong> ${file.name}</p>
            <p><strong>Size:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
          </div>
          <div class="file-content">
            <h2>File Contents</h2>
            ${tableContent}
          </div>
        </body>
      </html>
    `;

    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(previewContent);
      previewWindow.document.close();
    }
  };

  const handlePreview = () => {
    const currentFile = window.currentUploadedFile;
    
    if (!currentFile) {
      toast({
        title: "No file selected",
        description: "Please select a file first before previewing",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      let tableContent = '';
      try {
        const extension = currentFile.name.split('.').pop()?.toLowerCase();
        if (extension === 'xlsx' || extension === 'xls') {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          tableContent = createTableHTML(jsonData);
          openPreviewWindow(currentFile, tableContent);
        } else if (extension === 'csv') {
          const text = event.target?.result as string;
          Papa.parse(text, {
            complete: (results) => {
              tableContent = createTableHTML(results.data);
              openPreviewWindow(currentFile, tableContent);
            },
          });
          return;
        }
      } catch (error) {
        toast({
          title: "Error processing file",
          description: "Could not read the file contents",
          variant: "destructive",
        });
      }
    };

    if (currentFile.name.endsWith('.csv')) {
      reader.readAsText(currentFile);
    } else {
      reader.readAsBinaryString(currentFile);
    }
  };

  return (
    <DropdownMenuItem 
      onClick={handlePreview}
      disabled={!hasFile}
      className={!hasFile ? 'opacity-50 cursor-not-allowed' : ''}
    >
      <Eye className="mr-2 h-4 w-4" />
      Preview current file
    </DropdownMenuItem>
  );
};

export default PreviewButton;