import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import FileUpload from "../FileUpload";

interface HeaderProps {
  activeColumnSet: 'artikelen' | 'klanten';
  onColumnSetChange: (value: 'artikelen' | 'klanten') => void;
  onDataLoaded: (columns: string[], data: any[]) => void;
}

const Header = ({ activeColumnSet, onColumnSetChange, onDataLoaded }: HeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <FileUpload onDataLoaded={onDataLoaded}>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload file
          </Button>
        </FileUpload>
      </div>
    </div>
  );
};

export default Header;