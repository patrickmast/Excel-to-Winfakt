import { Upload } from 'lucide-react';
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

const FileSelector = () => {
  const handleSelect = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    
    // First, close the dropdown by finding and clicking the trigger button
    const dropdownTrigger = document.querySelector('[data-state="open"][role="button"]') as HTMLButtonElement;
    if (dropdownTrigger) {
      dropdownTrigger.click();
    }
    
    // After a small delay, trigger the file input
    setTimeout(() => {
      // Get the closest form element with data-upload-form attribute
      const forms = document.querySelectorAll('form[data-upload-form]');
      const form = Array.from(forms).find(form => {
        // Find the form that contains both the file input and is within the dropdown
        const hasFileInput = form.querySelector('input[type="file"]') !== null;
        const isInDropdown = form.closest('[role="menu"]') !== null;
        return hasFileInput && !isInDropdown;
      });
      
      const fileInput = form?.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      }
    }, 100); // Small delay to ensure the dropdown is closed first
  };

  return (
    <DropdownMenuItem onSelect={handleSelect}>
      <Upload className="mr-2 h-4 w-4" />
      Select file
    </DropdownMenuItem>
  );
};

export default FileSelector;