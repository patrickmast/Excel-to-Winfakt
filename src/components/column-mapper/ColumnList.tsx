import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { CardHeader, CardTitle } from '../ui/card';

interface ColumnListProps {
  title: string;
  columns: string[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedColumn: string | null;
  onColumnClick: (column: string) => void;
  isColumnMapped: (column: string) => boolean;
  searchPlaceholder: string;
}

const ColumnList = ({
  title,
  columns,
  searchValue,
  onSearchChange,
  selectedColumn,
  onColumnClick,
  isColumnMapped,
  searchPlaceholder,
}: ColumnListProps) => {
  const filteredColumns = columns.filter(column =>
    column.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div>
      <CardHeader className="px-0 pt-0">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <Input
        type="text"
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className="mb-4 w-full pr-4"
      />
      <ScrollArea className="h-[400px]">
        <div className="space-y-2 pr-4">
          {filteredColumns.map(column => (
            <div
              key={column}
              onClick={() => onColumnClick(column)}
              className={`p-3 rounded-md cursor-pointer transition-colors ${
                selectedColumn === column
                  ? 'bg-[#F0FEF5] border border-[#BBF7D0]'
                  : 'bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#E5E7EB]'
              } ${
                isColumnMapped(column)
                  ? 'bg-primary/10 text-primary pointer-events-none'
                  : ''
              }`}
            >
              <span className="text-sm">{column}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ColumnList;