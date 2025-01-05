import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';

interface ColumnMapperProps {
  sourceColumns: string[];
  targetColumns: string[];
  onMappingChange: (mapping: Record<string, string>) => void;
}

const ColumnMapper = ({ sourceColumns, targetColumns, onMappingChange }: ColumnMapperProps) => {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [sourceSearch, setSourceSearch] = useState('');
  const [targetSearch, setTargetSearch] = useState('');

  useEffect(() => {
    onMappingChange(mapping);
  }, [mapping, onMappingChange]);

  const handleMappingChange = (sourceColumn: string, targetColumn: string) => {
    setMapping(prev => ({
      ...prev,
      [sourceColumn]: targetColumn
    }));
  };

  const filteredSourceColumns = sourceColumns.filter(column =>
    column.toLowerCase().includes(sourceSearch.toLowerCase())
  );

  const filteredTargetColumns = targetColumns.filter(column =>
    column.toLowerCase().includes(targetSearch.toLowerCase())
  );

  const connectedColumns = Object.entries(mapping).filter(([_, target]) => target !== '');

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-8">
      {/* Connected Columns Section */}
      {connectedColumns.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Connected columns</h2>
          <div className="space-y-2">
            {connectedColumns.map(([source, target]) => (
              <div key={source} className="flex items-center gap-4 bg-green-50 p-4 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm">{source}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-gray-400">→</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm">{target}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Column Mapping Section */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">Source file columns</h2>
          <Input
            type="text"
            placeholder="Search source columns..."
            value={sourceSearch}
            onChange={(e) => setSourceSearch(e.target.value)}
            className="mb-4"
          />
          <div className="space-y-4">
            {filteredSourceColumns.map(column => (
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
          <h2 className="text-lg font-semibold mb-4">Winfakt columns</h2>
          <Input
            type="text"
            placeholder="Search Winfakt columns..."
            value={targetSearch}
            onChange={(e) => setTargetSearch(e.target.value)}
            className="mb-4"
          />
          <div className="space-y-2">
            {filteredTargetColumns.map(column => (
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