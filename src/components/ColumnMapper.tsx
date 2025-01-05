import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import ConnectedColumns from './column-mapper/ConnectedColumns';
import ColumnList from './column-mapper/ColumnList';
import { Button } from './ui/button';

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

  useEffect(() => {
    onMappingChange(mapping);
  }, [mapping, onMappingChange]);

  const handleSourceColumnClick = (column: string) => {
    if (selectedSourceColumn === column) {
      setSelectedSourceColumn(null);
    } else {
      setSelectedSourceColumn(column);
      if (selectedTargetColumn) {
        setMapping(prev => ({
          ...prev,
          [column]: selectedTargetColumn
        }));
        setSelectedSourceColumn(null);
        setSelectedTargetColumn(null);
      }
    }
  };

  const handleTargetColumnClick = (targetColumn: string) => {
    if (selectedTargetColumn === targetColumn) {
      setSelectedTargetColumn(null);
    } else {
      setSelectedTargetColumn(targetColumn);
      if (selectedSourceColumn) {
        setMapping(prev => ({
          ...prev,
          [selectedSourceColumn]: targetColumn
        }));
        setSelectedSourceColumn(null);
        setSelectedTargetColumn(null);
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

  const connectedColumns = Object.entries(mapping).filter(([_, target]) => target !== '');

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-8">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Connected columns</h3>
          {connectedColumns.length > 0 && (
            <Button 
              onClick={() => onExport(mapping)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Export CSV
            </Button>
          )}
        </div>
        
        <ConnectedColumns 
          connectedColumns={connectedColumns} 
          onDisconnect={handleDisconnect}
        />
        
        <div className="grid grid-cols-2 gap-8">
          <ColumnList
            title="Source file columns"
            columns={sourceColumns}
            searchValue={sourceSearch}
            onSearchChange={setSourceSearch}
            selectedColumn={selectedSourceColumn}
            onColumnClick={handleSourceColumnClick}
            isColumnMapped={(column) => column in mapping}
            searchPlaceholder="Search source columns..."
          />
          <ColumnList
            title="Winfakt columns"
            columns={targetColumns}
            searchValue={targetSearch}
            onSearchChange={setTargetSearch}
            selectedColumn={selectedTargetColumn}
            onColumnClick={handleTargetColumnClick}
            isColumnMapped={(column) => Object.values(mapping).includes(column)}
            searchPlaceholder="Search Winfakt columns..."
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ColumnMapper;