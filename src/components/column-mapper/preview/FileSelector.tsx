import { Upload } from 'lucide-react';
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

const FileSelector = () => {
  const handleSelect = (event: Event) => {
    event.preventDefault();
    // Find the closest parent form that contains the file input
    const form = document.querySelector('form[data-upload-form]');
    const fileInput = form?.querySelector('input[type="file"]') as HTMLInputElement;
    
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <DropdownMenuItem onSelect={handleSelect}>
      <Upload className="mr-2 h-4 w-4" />
      Select file
    </DropdownMenuItem>
  );
};

export default FileSelector;