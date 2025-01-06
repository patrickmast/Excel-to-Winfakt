import { Button } from '../ui/button';
import { Upload } from 'lucide-react';
import FileUpload from '../FileUpload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HeaderProps {
  activeColumnSet: 'artikelen' | 'klanten';
  onColumnSetChange: (value: 'artikelen' | 'klanten') => void;
  onDataLoaded: (columns: string[], data: any[]) => void;
}

const Header = ({ activeColumnSet, onColumnSetChange, onDataLoaded }: HeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <span>Source file columns</span>
      <FileUpload onDataLoaded={onDataLoaded}>
        <Button variant="outline" size="default" className="ml-2 h-10">
          <Upload className="h-4 w-4 mr-2" />
          Select file
        </Button>
      </FileUpload>
    </div>
  );
};

export default Header;