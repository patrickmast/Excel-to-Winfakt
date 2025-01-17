import { Eye } from 'lucide-react';
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    currentUploadedFile?: File;
  }
}

interface PreviewButtonProps {
  hasFile: boolean;
}

const PreviewButton = ({ hasFile }: PreviewButtonProps) => {
  const { toast } = useToast();

  const handlePreview = async () => {
    const currentFile = window.currentUploadedFile;
    
    if (!currentFile) {
      toast({
        title: "No file selected",
        description: "Please select a file first before previewing",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const reader = new FileReader();
      reader.onload = function(e) {
        const fileData = {
          id: fileId,
          name: currentFile.name,
          size: currentFile.size,
          content: e.target?.result,
          timestamp: Date.now()
        };
        localStorage.setItem(`preview_${fileId}`, JSON.stringify(fileData));
        
        const previewUrl = `/preview?fileId=${fileId}&filename=${encodeURIComponent(currentFile.name)}`;
        window.open(previewUrl, '_blank');
      };
      
      reader.readAsText(currentFile);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate preview link",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenuItem 
      onSelect={handlePreview}
      disabled={!hasFile}
      className={!hasFile ? 'opacity-50 cursor-not-allowed' : ''}
    >
      <Eye className="mr-2 h-4 w-4" />
      Preview current file
    </DropdownMenuItem>
  );
};

export default PreviewButton;