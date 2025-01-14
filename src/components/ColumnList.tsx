import { Input } from '@/components/ui/input';
import { VanillaCardHeader, VanillaCardTitle } from '@/components/vanilla/react/VanillaCard';
import '@/components/vanilla/react/VanillaCard.css';

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
  // First filter out mapped columns (for Winfakt columns only), then apply search filter
  const filteredColumns = columns
    .filter(column => title === "Source file columns" || !isColumnMapped(column))
    .filter(column => column.toLowerCase().includes(searchValue.toLowerCase()));

  return (
    <div>
      <VanillaCardHeader className="px-0 pt-0">
        <VanillaCardTitle>{title}</VanillaCardTitle>
      </VanillaCardHeader>
      <Input
        type="text"
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className="mb-4 w-full"
      />
      <div className="space-y-2">
        {filteredColumns.map(column => (
          <div
            key={column}
            onClick={() => onColumnClick(column)}
            className={`p-3 rounded-md cursor-pointer transition-colors hover:bg-gray-100 ${
              selectedColumn === column
                ? 'bg-[#F0FEF5] border border-[#BBF7D0]'
                : 'bg-[#F9FAFB] hover:bg-white hover:border-[#BBF7D0] border border-[#E5E7EB]'
            }`}
          >
            <span className="text-sm">{column}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColumnList;