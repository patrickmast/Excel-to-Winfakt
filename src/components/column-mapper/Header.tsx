import { Button } from '../ui/button';
import { Upload, Eye } from 'lucide-react';
import FileUpload from '../FileUpload';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  activeColumnSet: 'artikelen' | 'klanten';
  onColumnSetChange: (value: 'artikelen' | 'klanten') => void;
  onDataLoaded: (columns: string[], data: any[]) => void;
}

const Header = ({ activeColumnSet, onColumnSetChange, onDataLoaded }: HeaderProps) => {
  const { toast } = useToast();

  const handlePreview = () => {
    // Get the current file from FileUpload component's state
    const currentFile = window.currentUploadedFile;
    
    if (!currentFile) {
      toast({
        title: "No file selected",
        description: "Please select a file first before previewing",
        variant: "destructive",
      });
      return;
    }

    // Create preview window content
    const previewContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>File Preview - ${currentFile.name}</title>
          <link rel="icon" href="https://www.winfakt.be/assets/ico/favicon.ico" />
          <meta property="og:image" content="https://files.taxi/patrick/ufadZsPEjfAAKF2xsgOg.jpeg" />
          <style>
            body { font-family: Arial, sans-serif; margin: 2rem; }
            .file-info { margin-bottom: 2rem; }
            .file-content { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <div class="file-info">
            <h2>File Information</h2>
            <p><strong>Name:</strong> ${currentFile.name}</p>
            <p><strong>Size:</strong> ${(currentFile.size / 1024).toFixed(2)} KB</p>
          </div>
          <div class="file-content">
            <h2>File Contents</h2>
            <pre id="content"></pre>
          </div>
          <script>
            const reader = new FileReader();
            reader.onload = (e) => {
              document.getElementById('content').textContent = e.target.result;
            };
            reader.readAsText(${currentFile});
          </script>
        </body>
      </html>
    `;

    // Open preview in new window
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(previewContent);
      previewWindow.document.close();
    }
  };

  return (
    <div className="flex items-center justify-between">
      <span>Source file columns</span>
      <FileUpload onDataLoaded={onDataLoaded}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="default" className="ml-2 h-10">
              <Upload className="h-4 w-4 mr-2" />
              Source file
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Upload className="h-4 w-4 mr-2" />
              Select file
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => {
              e.preventDefault();
              handlePreview();
            }}>
              <Eye className="h-4 w-4 mr-2" />
              Preview current file
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </FileUpload>
    </div>
  );
};

export default Header;