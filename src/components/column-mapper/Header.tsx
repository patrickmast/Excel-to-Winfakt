import { Button } from '../ui/button';
import { ChevronDown } from 'lucide-react';
import FileUpload from '../FileUpload';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FileSelector from './preview/FileSelector';
import PreviewButton from './preview/PreviewButton';

interface HeaderProps {
  activeColumnSet: 'artikelen' | 'klanten';
  onColumnSetChange: (value: 'artikelen' | 'klanten') => void;
  onDataLoaded: (columns: string[], data: any[]) => void;
}

const Header = ({ activeColumnSet, onColumnSetChange, onDataLoaded }: HeaderProps) => {
  const hasFile = !!window.currentUploadedFile;

  return (
    <div className="flex items-center justify-between">
      <span>Source file columns</span>
      <FileUpload onDataLoaded={onDataLoaded}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="default" className="ml-2">
              Source file
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <FileSelector />
            <PreviewButton hasFile={hasFile} />
          </DropdownMenuContent>
        </DropdownMenu>
      </FileUpload>
    </div>
  );
};

export default Header;