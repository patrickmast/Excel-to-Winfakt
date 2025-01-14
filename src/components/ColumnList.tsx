import { VanillaInput } from '@/components/vanilla/react/VanillaInput';
import { VanillaCardHeader, VanillaCardTitle } from '@/components/vanilla/react/VanillaCard';
import '@/components/vanilla/react/VanillaCard.css';
import '@/components/vanilla/Input.css';
import '@/components/vanilla/ColumnList.css';

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
      <VanillaCardHeader className="column-list-header">
        <VanillaCardTitle>{title}</VanillaCardTitle>
      </VanillaCardHeader>
      <VanillaInput
        type="text"
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className="mb-4"
      />
      <div className="column-list-container">
        {filteredColumns.map(column => (
          <div
            key={column}
            onClick={() => onColumnClick(column)}
            className={`column-list-item ${selectedColumn === column ? 'selected' : ''}`}
          >
            <span className="column-list-item-text">{column}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColumnList;