import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Info, Menu, Plus, Save } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  onSaveNew: () => void;
  onSave: () => void;
  onInfoClick: () => void;
  isSaving: boolean;
}

const Header = ({ onSaveNew, onSave, onInfoClick, isSaving }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleInfoClick = () => {
    onInfoClick();
    setIsMenuOpen(false);
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900">CSV/Excel Converter</h1>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="default" className="flex items-center gap-2">
            <Menu className="h-5 w-5" />
            Menu
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onSaveNew()} disabled={isSaving}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Save as New</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSave()} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            <span>Save</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleInfoClick}>
            <Info className="mr-2 h-4 w-4" />
            <span>Info</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Header;