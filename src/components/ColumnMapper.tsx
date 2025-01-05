import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import ConnectedColumns from './column-mapper/ConnectedColumns';
import ColumnList from './column-mapper/ColumnList';

interface ColumnMapperProps {
  sourceColumns: string[];
  targetColumns: string[];
  onMappingChange: (mapping: Record<string, string>) => void;
  onExport: (mapping: Record<string, string>) => void;
}

const ColumnMapper = ({ sourceColumns, targetColumns, onMappingChange, onExport }: ColumnMapperProps) => {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [sourceSearch, setSourceSearch] = useState('');
  const [targetSearch, setTargetSearch] = useState('');
  const [selectedSourceColumn, setSelectedSourceColumn] = useState<string | null>(null);
  const [selectedTargetColumn, setSelectedTargetColumn] = useState<string | null>(null);
  const [connectionCounter, setConnectionCounter] = useState<number>(0);

  useEffect(() => {
    onMappingChange(mapping);
  }, [mapping, onMappingChange]);

  const handleSourceColumnClick = (column: string) => {
    if (selectedSourceColumn === column) {
      setSelectedSourceColumn(null);
    } else {
      setSelectedSourceColumn(column);
      if (selectedTargetColumn) {
        const uniqueKey = `${column}_${connectionCounter}`;
        setMapping(prev => ({
          ...prev,
          [uniqueKey]: selectedTargetColumn
        }));
        setConnectionCounter(prev => prev + 1);
        setSelectedSourceColumn(null);
        setSelectedTargetColumn(null);
        // Reset search fields after connecting columns
        setSourceSearch('');
        setTargetSearch('');
      }
    }
  };

  const handleTargetColumnClick = (targetColumn: string) => {
    if (selectedTargetColumn === targetColumn) {
      setSelectedTargetColumn(null);
    } else {
      setSelectedTargetColumn(targetColumn);
      if (selectedSourceColumn) {
        const uniqueKey = `${selectedSourceColumn}_${connectionCounter}`;
        setMapping(prev => ({
          ...prev,
          [uniqueKey]: targetColumn
        }));
        setConnectionCounter(prev => prev + 1);
        setSelectedSourceColumn(null);
        setSelectedTargetColumn(null);
        // Reset search fields after connecting columns
        setSourceSearch('');
        setTargetSearch('');
      }
    }
  };

  const handleDisconnect = (sourceColumn: string) => {
    setMapping(prev => {
      const newMapping = { ...prev };
      delete newMapping[sourceColumn];
      return newMapping;
    });
  };

  const connectedColumns = Object.entries(mapping).map(([key, target]) => {
    const sourceColumn = key.split('_')[0];
    return [sourceColumn, target] as [string, string];
  }).filter(([_, target]) => target !== '');

  // Get all unique target columns that are currently mapped
  const mappedTargetColumns = new Set(Object.values(mapping));

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg border border-gray-200 py-4 px-6">
        <ConnectedColumns 
          connectedColumns={connectedColumns} 
          onDisconnect={handleDisconnect}
          onExport={() => onExport(mapping)}
        />
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-8">
            <ColumnList
              title="Source file columns"
              columns={sourceColumns}
              searchValue={sourceSearch}
              onSearchChange={setSourceSearch}
              selectedColumn={selectedSourceColumn}
              onColumnClick={handleSourceColumnClick}
              isColumnMapped={(column) => false} // Source columns can always be selected
              searchPlaceholder="Search source columns..."
            />
            <ColumnList
              title="Winfakt columns"
              columns={targetColumns}
              searchValue={targetSearch}
              onSearchChange={setTargetSearch}
              selectedColumn={selectedTargetColumn}
              onColumnClick={handleTargetColumnClick}
              isColumnMapped={(column) => mappedTargetColumns.has(column)}
              searchPlaceholder="Search Winfakt columns..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ColumnMapper;