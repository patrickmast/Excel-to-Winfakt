import React from 'react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search source columns"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full"
      />
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-2">
          {filteredColumns.map((col) => (
            <div
              key={col}
              onClick={() => onColumnSelect(col)}
              className="p-3 rounded-md cursor-pointer transition-colors bg-muted hover:bg-accent"
            >
              <span className="text-sm">{col}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ColumnSelector;