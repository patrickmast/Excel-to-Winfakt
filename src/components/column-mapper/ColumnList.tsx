import { Input } from '@/components/ui/input';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode, useState } from 'react';
import ColumnPreview from './ColumnPreview';
import { identifyColumnGroups } from '@/utils/columnGroups';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface ColumnListProps {
  title: ReactNode;
  columns: string[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedColumn: string | null;
  onColumnClick: (column: string) => void;
  isColumnMapped: (column: string) => boolean;
  searchPlaceholder: string;
  columnTransforms?: Record<string, string>;
  sourceData?: any[];
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
  columnTransforms = {},
  sourceData = []
}: ColumnListProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const getPreviewValue = (column: string): string | null => {
    if (!sourceData.length) return null;
    const firstRow = sourceData[0];
    return firstRow[column] !== undefined ? String(firstRow[column]) : null;
  };

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  // First filter by search, then handle mapped columns at the group level
  let filteredColumns = columns
    .filter(column => column.toLowerCase().includes(searchValue.toLowerCase()));

  // Only apply grouping to Winfakt columns
  const isWinfaktList = title !== "Source file columns";
  const columnGroups = isWinfaktList ? identifyColumnGroups(filteredColumns) : [];
  const groupedColumns = new Set(columnGroups.flatMap(g => g.columns));

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
        className="mb-4 w-full"
      />
      <div className="space-y-2">
        {isWinfaktList ? (
          filteredColumns.map(column => {
            // Find if this column belongs to a group
            const group = columnGroups.find(g => g.columns.includes(column));

            if (group) {
              // If this is the first column in the group, render the group header
              if (group.columns[0] === column) {
                // Check if all columns in the group are mapped
                const allGroupColumnsMapped = group.columns.every(col => isColumnMapped(col));

                // Skip the entire group if all columns are mapped
                if (allGroupColumnsMapped) {
                  return null;
                }

                // Filter out mapped columns from the group
                const unmappedGroupColumns = group.columns.filter(col => !isColumnMapped(col));

                return (
                  <div key={column}>
                    <div
                      onClick={() => toggleGroup(group.name)}
                      className="p-3 rounded-md cursor-pointer transition-colors bg-[#F9FAFB] hover:bg-[#F0FFF6] hover:border-[#BBF7D0] border border-[#E5E7EB] flex items-center justify-between"
                    >
                      <span className="text-sm">{group.name}</span>
                      {expandedGroups.has(group.name) ? (
                        <ChevronDown className="h-4 w-4 ml-2" />
                      ) : (
                        <ChevronRight className="h-4 w-4 ml-2" />
                      )}
                    </div>
                    {expandedGroups.has(group.name) && (
                      <div className="ml-4 mt-2 space-y-2">
                        {unmappedGroupColumns.map(groupColumn => (
                          <ColumnPreview
                            key={groupColumn}
                            columnName={groupColumn}
                            previewValue={getPreviewValue(groupColumn)}
                            isSelected={selectedColumn === groupColumn}
                            onClick={() => onColumnClick(groupColumn)}
                            showPreview={false}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              // Always skip other columns in the group
              return null;
            }

            // Render non-grouped columns normally (if not mapped)
            return !isColumnMapped(column) ? (
              <ColumnPreview
                key={column}
                columnName={column}
                previewValue={getPreviewValue(column)}
                isSelected={selectedColumn === column}
                onClick={() => onColumnClick(column)}
                showPreview={false}
              />
            ) : null;
          }).filter(Boolean)
        ) : (
          filteredColumns.map(column => (
            <ColumnPreview
              key={column}
              columnName={column}
              previewValue={getPreviewValue(column)}
              isSelected={selectedColumn === column}
              onClick={() => onColumnClick(column)}
              showPreview={true}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ColumnList;