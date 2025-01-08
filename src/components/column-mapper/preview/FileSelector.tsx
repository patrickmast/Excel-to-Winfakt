import { Upload } from 'lucide-react';
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

const FileSelector = () => {
  const handleSelect = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    
    // First, find the dropdown trigger button and close the dropdown
    const dropdownTrigger = document.querySelector('[data-state="open"][role="button"]') as HTMLButtonElement;
    if (dropdownTrigger) {
      dropdownTrigger.click();
    }
    
    // Use requestAnimationFrame to ensure the dropdown is fully closed
    requestAnimationFrame(() => {
      // Get the closest form element with data-upload-form attribute
      const forms = document.querySelectorAll('form[data-upload-form]');
      const form = Array.from(forms).find(form => {
        // Find the form that contains both the file input and is not within the dropdown
        const hasFileInput = form.querySelector('input[type="file"]') !== null;
        const isInDropdown = form.closest('[role="menu"]') !== null;
        return hasFileInput && !isInDropdown;
      });
      
      if (form) {
        const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.click();
        }
      }
    });
  };

  return (
    <DropdownMenuItem onSelect={handleSelect}>
      <Upload className="mr-2 h-4 w-4" />
      Select file
    </DropdownMenuItem>
  );
};

export default FileSelector;