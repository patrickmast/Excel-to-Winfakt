import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import ConnectedColumns from './column-mapper/ConnectedColumns';
import ColumnList from './column-mapper/ColumnList';
import FileUpload from './FileUpload';
import { Button } from './ui/button';
import { Upload } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ColumnMapperProps {
  targetColumns: string[];
  onMappingChange: (mapping: Record<string, string>) => void;
  onExport: (mapping: Record<string, string>) => void;
  onDataLoaded: (data: any[]) => void;
  activeColumnSet: 'artikelen' | 'klanten';
  onColumnSetChange: (value: 'artikelen' | 'klanten') => void;
}

const ColumnMapper = ({ 
  targetColumns, 
  onMappingChange, 
  onExport, 
  onDataLoaded,
  activeColumnSet,
  onColumnSetChange 
}: ColumnMapperProps) => {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [columnTransforms, setColumnTransforms] = useState<Record<string, string>>({});
  const [sourceSearch, setSourceSearch] = useState('');
  const [targetSearch, setTargetSearch] = useState('');
  const [selectedSourceColumn, setSelectedSourceColumn] = useState<string | null>(null);
  const [selectedTargetColumn, setSelectedTargetColumn] = useState<string | null>(null);
  const [connectionCounter, setConnectionCounter] = useState<number>(0);
  const [sourceColumns, setSourceColumns] = useState<string[]>([]);

  useEffect(() => {
    onMappingChange(mapping);
  }, [mapping, onMappingChange]);

  // Reset mapping when column set changes
  useEffect(() => {
    setMapping({});
    setColumnTransforms({});
  }, [activeColumnSet]);

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
    setColumnTransforms(prev => {
      const newTransforms = { ...prev };
      delete newTransforms[sourceColumn];
      return newTransforms;
    });
  };

  const handleFileData = (columns: string[], data: any[]) => {
    setSourceColumns(columns);
    onDataLoaded(data);
  };

  const handleExport = () => {
    const transformedData = sourceData.map(row => {
      const newRow: Record<string, any> = {};
      Object.entries(mapping).forEach(([source, target]) => {
        const sourceColumn = source.split('_')[0];
        let value = row[sourceColumn];
        
        // Apply transform if it exists
        if (columnTransforms[sourceColumn]) {
          try {
            // Create a new Function to evaluate the transform code
            const transform = new Function('value', `return ${columnTransforms[sourceColumn]}`);
            value = transform(value);
          } catch (error) {
            console.error(`Error transforming column ${sourceColumn}:`, error);
          }
        }
        
        newRow[target] = value;
      });
      return newRow;
    });
    
    downloadCSV(transformedData, 'converted.csv');
    toast({
      title: "Export successful",
      description: "Your file has been converted and downloaded",
    });
  };

  const connectedColumns = Object.entries(mapping).map(([key, target]) => {
    const sourceColumn = key.split('_')[0];
    return [sourceColumn, target] as [string, string];
  }).filter(([_, target]) => target !== '');

  const mappedTargetColumns = new Set(Object.values(mapping));

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg border border-gray-200 py-4 px-6">
        <ConnectedColumns 
          connectedColumns={connectedColumns} 
          onDisconnect={handleDisconnect}
          onExport={handleExport}
          onUpdateTransform={(column, code) => {
            setColumnTransforms(prev => ({
              ...prev,
              [column]: code
            }));
          }}
          columnTransforms={columnTransforms}
        />
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-8">
            <ColumnList
              title={
                <div className="flex items-center justify-between">
                  <span>Source file columns</span>
                  <FileUpload onDataLoaded={handleFileData}>
                    <Button variant="outline" size="default" className="ml-2 h-10">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload file
                    </Button>
                  </FileUpload>
                </div>
              }
              columns={sourceColumns}
              searchValue={sourceSearch}
              onSearchChange={setSourceSearch}
              selectedColumn={selectedSourceColumn}
              onColumnClick={handleSourceColumnClick}
              isColumnMapped={(column) => false}
              searchPlaceholder="Search source columns..."
            />
            <ColumnList
              title={
                <div className="flex items-center justify-between">
                  <span>Winfakt columns</span>
                  <Select value={activeColumnSet} onValueChange={onColumnSetChange}>
                    <SelectTrigger className="w-[140px] ml-2 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="artikelen">Artikelen</SelectItem>
                      <SelectItem value="klanten">Klanten</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              }
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
