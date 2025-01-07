import { Upload } from 'lucide-react';
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

const FileSelector = () => {
  const handleClick = (event: Event) => {
    event.preventDefault();
    // Find and trigger the hidden file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <DropdownMenuItem onSelect={handleClick}>
      <Upload className="mr-2 h-4 w-4" />
      Select file
    </DropdownMenuItem>
  );
};

export default FileSelector;