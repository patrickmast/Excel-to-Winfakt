import { Upload } from 'lucide-react';
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

const FileSelector = () => {
  return (
    <DropdownMenuItem>
      <Upload className="mr-2 h-4 w-4" />
      Select file
    </DropdownMenuItem>
  );
};

export default FileSelector;