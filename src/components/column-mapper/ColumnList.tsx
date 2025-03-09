import { VanillaInput } from '@/components/vanilla/react/VanillaInput';
import {
  VanillaCard,
  VanillaCardHeader,
  VanillaCardTitle,
  VanillaCardContent,
  VanillaCardFooter,
  VanillaCardDescription
} from '@/components/vanilla/react/VanillaCard';
import '@/components/vanilla/Card.css';
import '@/components/vanilla/Input.css';
import React, { ReactNode, useState } from 'react';
import ColumnPreview from './ColumnPreview';
import { identifyColumnGroups } from '@/utils/columnGroups';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from './Header';

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
  const { t } = useTranslation();

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

  // Get display name for columns - this only affects the UI, not the exported CSV
  const getDisplayName = (column: string): string => {
    // Handle special cases for column display names
    switch (column) {
      case "Intrastat, lidstaat van herkomst":
      case "Intrastat, standaard gewest":
      case "Intrastat, goederencode":
      case "Intrastat, gewicht per eenheid":
      case "Intrastat, land van oorsprong":
        return column.replace("Intrastat, ", "");
      case "Netto verkoopprijs 1":
        return "Netto verkoopprijs";
      case "Actief?":
        return "Artikel is actief";
      case "Korting uitgeschakeld":
        return "Korting uitschakelen";
      case "merk":
        return "Merk";
      case "Rekeningnummer":
        return "Grootboekrekening boekhouding";
      case "Aantal 2":
        return "Standaard waarde voor 2e aantal";
      default:
        return column;
    }
  };

  // First filter by search, then handle mapped columns at the group level
  let filteredColumns = columns
    .filter(column => {
      // For source columns, show all. For Winfakt columns, only show unmapped ones
      const passesMapping = title === "Source file columns" || !isColumnMapped(column);
      // Apply search filter - make sure to handle case where searchValue is undefined
      const passesSearch = !searchValue || column.toLowerCase().includes(searchValue.toLowerCase());
      return passesMapping && passesSearch;
    });

  // Only apply grouping to Winfakt columns
  // Determine if this is a source column list or Winfakt list
  // We need to check if the title is a React component (Header) or a string
  // For source columns, we use the Header component which contains sourceColumns text
  // For target columns, we use a div with targetColumns text
  const isSourceColumnList = typeof title !== 'string' && React.isValidElement(title) && title.type === Header;
  const isWinfaktList = !isSourceColumnList;
  
  // Important: Use all columns for identifying groups, not just filtered ones
  // This ensures groups maintain their original order even when some columns are mapped
  const allColumnGroups = isWinfaktList ? identifyColumnGroups(columns) : [];
  
  // Then filter the groups to only include columns that pass our filters
  const columnGroups = allColumnGroups.map(group => ({
    ...group,
    columns: group.columns.filter(col => filteredColumns.includes(col))
  })).filter(group => group.columns.length > 0);
  
  // Create a set of all columns that belong to any group
  const groupedColumns = new Set(allColumnGroups.flatMap(g => g.columns));

  // Create a set to track which groups have already been rendered
  const renderedGroups = new Set<string>();

  return (
    <VanillaCard>
      <VanillaCardHeader className="px-0 pt-0">
        <VanillaCardTitle className="text-[20px]">{title}</VanillaCardTitle>
      </VanillaCardHeader>
      <VanillaInput
        type="text"
        placeholder={searchPlaceholder}
        value={searchValue || ''}
        onChange={(e: any) => onSearchChange(e.target.value)}
        className="mb-4 w-full"
      />
      <div className="space-y-2">
        {filteredColumns.length === 0 && (
          <div className="text-sm text-gray-500 py-2">
            {isWinfaktList ? t('columnMapper.noTargetColumns') : t('columnMapper.noSourceColumns')}
          </div>
        )}
        {filteredColumns.length > 0 && isWinfaktList ? (
          <>
            {/* Get the original column order from the parent component */}
            {/* We need to process columns in their original order to maintain the specified sequence */}
            {columns.filter(column => {
              // Only include columns that pass our filters and aren't mapped yet
              return filteredColumns.includes(column) && !isColumnMapped(column);
            }).map(column => {
              // Check if this column belongs to a group
              const group = allColumnGroups.find(g => g.columns.includes(column));
              
              if (group) {
                // If we've already rendered this group, skip it
                if (renderedGroups.has(group.name)) {
                  return null;
                }
                
                // Mark this group as rendered
                renderedGroups.add(group.name);
                
                // Filter out mapped columns from the group
                const unmappedGroupColumns = group.columns.filter(col => 
                  filteredColumns.includes(col) && !isColumnMapped(col) && col
                );
                
                // Skip the entire group if all columns are mapped or filtered out
                if (unmappedGroupColumns.length === 0) {
                  return null;
                }
                
                // Render the group
                return (
                  <div key={group.name}>
                    <div
                      onClick={() => toggleGroup(group.name)}
                      className="p-3 rounded-md cursor-pointer transition-colors bg-[#F9FAFB] hover:bg-[#F0FFF6] hover:border-[#BBF7D0] border border-[#E5E7EB] flex items-center justify-between h-[48px]"
                    >
                      <span className="text-sm">{group.name}</span>
                      {expandedGroups.has(group.name) ? (
                        <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 ml-2 text-gray-400" />
                      )}
                    </div>
                    {expandedGroups.has(group.name) && (
                      <div className="ml-4 mt-2 space-y-2">
                        {unmappedGroupColumns.map(groupColumn => (
                          <ColumnPreview
                            key={groupColumn}
                            columnName={getDisplayName(groupColumn)}
                            originalColumnName={groupColumn}
                            previewValue={getPreviewValue(groupColumn)}
                            isSelected={selectedColumn === groupColumn}
                            onClick={() => onColumnClick(groupColumn)}
                            showPreview={false}
                            showInfo={isSourceColumnList}
                            sourceData={sourceData}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              } else {
                // This is an individual column, not part of any group
                return (
                  <ColumnPreview
                    key={column}
                    columnName={getDisplayName(column)}
                    originalColumnName={column}
                    previewValue={getPreviewValue(column)}
                    isSelected={selectedColumn === column}
                    onClick={() => onColumnClick(column)}
                    showPreview={false}
                    showInfo={isSourceColumnList}
                    sourceData={sourceData}
                  />
                );
              }
            })}
          </>
        ) : (
          filteredColumns.length > 0 && filteredColumns.filter(column => column).map(column => (
            <ColumnPreview
              key={column}
              columnName={column}
              originalColumnName={column}
              previewValue={getPreviewValue(column)}
              isSelected={selectedColumn === column}
              onClick={() => onColumnClick(column)}
              showPreview={true}
              showInfo={isSourceColumnList}
              sourceData={sourceData}
            />
          ))
        )}
      </div>
    </VanillaCard>
  );
};

export default ColumnList;