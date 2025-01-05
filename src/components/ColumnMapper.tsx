import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface ColumnMapperProps {
  sourceColumns: string[];
  targetColumns: string[];
  onMappingChange: (mapping: Record<string, string>) => void;
}

const ColumnMapper = ({ sourceColumns, targetColumns, onMappingChange }: ColumnMapperProps) => {
  const [mapping, setMapping] = useState<Record<string, string>>({});

  useEffect(() => {
    onMappingChange(mapping);
  }, [mapping, onMappingChange]);

  const handleMappingChange = (sourceColumn: string, targetColumn: string) => {
    setMapping(prev => ({
      ...prev,
      [sourceColumn]: targetColumn
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">Source Columns</h2>
          <div className="space-y-4">
            {sourceColumns.map(column => (
              <div key={column} className="flex items-center space-x-4">
                <span className="flex-1 truncate text-sm">{column}</span>
                <Select
                  value={mapping[column] || 'none'}
                  onValueChange={(value) => handleMappingChange(column, value === 'none' ? '' : value)}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Map to..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {targetColumns.map(targetColumn => (
                      <SelectItem key={targetColumn} value={targetColumn}>
                        {targetColumn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-4">Target Columns</h2>
          <div className="space-y-2">
            {targetColumns.map(column => (
              <div
                key={column}
                className={`p-2 rounded text-sm ${
                  Object.values(mapping).includes(column)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-500'
                }`}
              >
                {column}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnMapper;