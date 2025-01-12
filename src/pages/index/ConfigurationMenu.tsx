import { Menu, Save, Plus, Info } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

interface ConfigurationMenuProps {
  onSaveNew: () => void;
  onSave: () => void;
  onInfo: () => void;
  isSaving: boolean;
}

const ConfigurationMenu = ({ onSaveNew, onSave, onInfo, isSaving }: ConfigurationMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="default" className="flex items-center gap-2" aria-label="Open menu">
          <Menu className="h-5 w-5" />
          Menu
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={onSaveNew}
          disabled={isSaving}
        >
          <Plus className="mr-2 h-4 w-4" aria-label="Add new configuration" />
          <span>Save as New</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onSave}
          disabled={isSaving}
        >
          <Save className="mr-2 h-4 w-4" aria-label="Save configuration" />
          <span>Save</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onInfo}>
          <Info className="mr-2 h-4 w-4" aria-label="Information" />
          <span>Info</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ConfigurationMenu;