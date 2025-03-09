import { ArrowRight, X, Download, Filter, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ColumnSettingsDialog from './ColumnSettingsDialog';
import { VanillaCard, VanillaCardContent, VanillaCardHeader, VanillaCardTitle } from '../vanilla/react/VanillaCard';
import ColumnPreview from './ColumnPreview';
import '../vanilla/Button.css';
import { FilterDialog, CompoundFilter, SingleCondition } from './FilterDialog';
import { Badge } from '@/components/ui/badge';
import { ExportButton } from '@/components/ui/export-button';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import classnames from 'classnames'; // Fix classnames import

interface ConnectedColumnsProps {
  connectedColumns: [string, string, string][]; // [uniqueKey, sourceColumn, targetColumn]
  onDisconnect?: (source: string) => void;
  onExport?: (filteredData?: any[]) => void;
  onUpdateTransform?: (uniqueKey: string, code: string) => void;
  onReorder?: (newOrder: [string, string, string][]) => void;
  columnTransforms?: Record<string, string>;
  sourceColumns: string[];
  sourceData?: any[];
  activeFilter: CompoundFilter | null;
  onFilterChange: (filter: CompoundFilter | null) => void;
}

interface SortableColumnItemProps {
  uniqueKey: string;
  sourceColumn: string;
  targetColumn: string;
  onDisconnect: (uniqueKey: string) => void;
  getPreviewValue: (uniqueKey: string, sourceColumn: string) => string | null;
  setSelectedColumn: (column: string | null) => void;
}

const SortableColumnItem = ({
  uniqueKey,
  sourceColumn,
  targetColumn,
  onDisconnect,
  getPreviewValue,
  setSelectedColumn
}: SortableColumnItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: uniqueKey });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative flex items-center gap-4"
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-5 cursor-grab hover:text-gray-700 text-gray-400"
      >
        <MoreVertical className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <ColumnPreview
          columnName={sourceColumn}
          previewValue={getPreviewValue(uniqueKey, sourceColumn)}
          onClick={() => setSelectedColumn(uniqueKey)}
          showSettings={true}
        />
      </div>
      <div className="flex-shrink-0 group">
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:hidden" />
        <X
          className="h-4 w-4 text-red-500 hidden group-hover:block cursor-pointer"
          onClick={() => onDisconnect(uniqueKey)}
        />
      </div>
      <div className="flex-1 min-w-0">
        <ColumnPreview
          columnName={targetColumn}
          className="bg-[#F0FEF5] border border-[#BBF7D0]"
        />
      </div>
    </div>
  );
};

const ConnectedColumns = ({
  connectedColumns,
  onDisconnect,
  onExport,
  onUpdateTransform,
  onReorder,
  columnTransforms = {},
  sourceColumns = [],
  sourceData = [],
  activeFilter,
  onFilterChange
}: ConnectedColumnsProps) => {
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('ShowFilter');
  const showFilter = !filterParam || filterParam.toLowerCase() === 'yes';
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const { t } = useTranslation();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = connectedColumns.findIndex(([key]) => key === active.id);
      const newIndex = connectedColumns.findIndex(([key]) => key === over.id);

      const newOrder = arrayMove(connectedColumns, oldIndex, newIndex);
      onReorder?.(newOrder);
    }
  };

  const handleDisconnect = (uniqueKey: string) => {
    if (onDisconnect) {
      onDisconnect(uniqueKey);
    }
  };

  const handleApplyFilter = (filter: CompoundFilter | null) => {
    if (onFilterChange) {
      onFilterChange(filter);
      setShowFilterDialog(false);
    }
  };

  const handleExport = () => {
    if (!onExport || !sourceData) return;

    let dataToExport = sourceData;

    if (activeFilter && activeFilter.groups && activeFilter.groups.length > 0) {
      dataToExport = sourceData.filter(row => {
        return activeFilter.groups.every(group => {
          const conditions = group.conditions || [];
          return group.type === 'AND'
            ? conditions.every(condition => evaluateCondition(condition, row))
            : conditions.some(condition => evaluateCondition(condition, row));
        });
      });
    }

    onExport(dataToExport);
  };

  const evaluateCondition = (condition: SingleCondition, row: any) => {
    const value = row[condition.column];
    const compareValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return String(value).toLowerCase() === String(compareValue).toLowerCase();
      case 'not_equals':
        return String(value).toLowerCase() !== String(compareValue).toLowerCase();
      case 'contains':
        return String(value).toLowerCase().includes(String(compareValue).toLowerCase());
      case 'not_contains':
        return !String(value).toLowerCase().includes(String(compareValue).toLowerCase());
      case 'starts_with':
        return String(value).toLowerCase().startsWith(String(compareValue).toLowerCase());
      case 'ends_with':
        return String(value).toLowerCase().endsWith(String(compareValue).toLowerCase());
      default:
        return false;
    }
  };

  const getPreviewValue = (uniqueKey: string, sourceColumn: string): string | null => {
    if (!sourceData?.length) return null;

    const firstRow = sourceData[0];
    let value = firstRow[sourceColumn];

    // Apply transform if it exists
    if (columnTransforms[uniqueKey]) {
      try {
        const transform = new Function('value', 'row', `return ${columnTransforms[uniqueKey]}`);
        value = transform(value, firstRow);
      } catch (error) {
        console.error(`Error computing preview for ${sourceColumn}:`, error);
        value = 'Error in transform';
      }
    }

    return value !== undefined ? String(value) : null;
  };

  return (
    <VanillaCard className="w-full bg-white rounded-lg border border-gray-200 py-4">
      <VanillaCardHeader className="px-6 py-0">
        <div className="flex items-center justify-between w-full">
          <VanillaCardTitle className="text-xl font-semibold">{t('columnMapper.connectedColumns')}</VanillaCardTitle>
          <div className="flex gap-2">
            {showFilter && (
              <Button
                onClick={() => setShowFilterDialog(true)}
                variant={activeFilter ? "default" : "outline"}
                className={classnames({
                  'bg-blue-100 border-blue-500 text-blue-700 hover:bg-blue-200 hover:text-blue-800': activeFilter,
                })}
              >
                <Filter className="h-4 w-4 mr-2" />
                {activeFilter ? t('columnMapper.filterActive') : t('columnMapper.filterButton')}
              </Button>
            )}
            {onExport && (
              <ExportButton
                onClick={handleExport}
                disabled={connectedColumns.length === 0}
              />
            )}
          </div>
        </div>
      </VanillaCardHeader>
      {connectedColumns.length > 0 && (
        <VanillaCardContent className="w-full space-y-2 mt-4 px-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={connectedColumns.map(([key]) => key)}
              strategy={verticalListSortingStrategy}
            >
              {connectedColumns.map(([uniqueKey, sourceColumn, targetColumn]) => (
                <SortableColumnItem
                  key={uniqueKey}
                  uniqueKey={uniqueKey}
                  sourceColumn={sourceColumn}
                  targetColumn={targetColumn}
                  onDisconnect={handleDisconnect}
                  getPreviewValue={getPreviewValue}
                  setSelectedColumn={setSelectedColumn}
                />
              ))}
            </SortableContext>
          </DndContext>
        </VanillaCardContent>
      )}
      {selectedColumn && (
        <ColumnSettingsDialog
          isOpen={!!selectedColumn}
          onClose={() => setSelectedColumn(null)}
          columnName={connectedColumns.find(([key]) => key === selectedColumn)?.[1] || ''}
          initialCode={columnTransforms[selectedColumn] || ''}
          onSave={(code) => {
            onUpdateTransform?.(selectedColumn, code);
            setSelectedColumn(null);
          }}
          sourceColumns={sourceColumns}
          sourceData={sourceData}
        />
      )}
      <FilterDialog
        isOpen={showFilterDialog}
        onClose={() => setShowFilterDialog(false)}
        sourceColumns={sourceColumns}
        sourceData={sourceData}
        onApplyFilter={handleApplyFilter}
        initialFilter={activeFilter}
      />
    </VanillaCard>
  );
};

export default ConnectedColumns;