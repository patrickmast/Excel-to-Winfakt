import React from 'react';
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ColumnSelectorProps {
  sourceColumns: string[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onColumnSelect: (columnName: string) => void;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  sourceColumns,
  searchTerm,
  onSearchChange,
  onColumnSelect,
}) => {
  const filteredColumns = sourceColumns.filter(col => 
    col.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleColumnSelect = (columnName: string) => {
    onColumnSelect(columnName);
    // Find and click the trigger button to close the dropdown
    const dropdownTrigger = document.querySelector('[data-state="open"][role="button"]') as HTMLButtonElement;
    if (dropdownTrigger) {
      dropdownTrigger.click();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Insert Column
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="max-h-[300px] overflow-y-auto">
        <DropdownMenuLabel>Available Columns</DropdownMenuLabel>
        <Input
          placeholder="Search source columns"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="mx-1 my-1 w-[calc(100%-8px)]"
        />
        <DropdownMenuSeparator />
        {filteredColumns.map((col) => (
          <DropdownMenuItem
            key={col}
            onSelect={(e) => {
              e.preventDefault();
              handleColumnSelect(col);
            }}
          >
            {col}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ColumnSelector;