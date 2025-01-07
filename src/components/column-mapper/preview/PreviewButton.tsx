import { Eye } from 'lucide-react';
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';

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
      const formData = new FormData();
      formData.append('file', currentFile);

      const response = await fetch('/api/upload-preview', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const { fileId } = await response.json();
      const previewUrl = `/preview?fileId=${fileId}&filename=${encodeURIComponent(currentFile.name)}`;
      window.open(previewUrl, '_blank');
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