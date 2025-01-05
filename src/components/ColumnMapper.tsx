import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { ArrowRight } from 'lucide-react';

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
    <Card className="w-full">
      <CardContent className="p-6 space-y-8">
        {/* Connected Columns Section */}
        {connectedColumns.length > 0 && (
          <div>
            <CardHeader className="px-0 pt-0">
              <CardTitle>Connected columns</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[200px] w-full rounded-md border">
              <div className="p-4 space-y-2">
                {connectedColumns.map(([source, target]) => (
                  <div 
                    key={source} 
                    className="flex items-center gap-4 bg-secondary/50 p-4 rounded-md border border-border"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{source}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{target}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Column Mapping Section */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <CardHeader className="px-0 pt-0">
              <CardTitle>Source file columns</CardTitle>
            </CardHeader>
            <Input
              type="text"
              placeholder="Search source columns..."
              value={sourceSearch}
              onChange={(e) => setSourceSearch(e.target.value)}
              className="mb-4"
            />
            <ScrollArea className="h-[400px]">
              <div className="space-y-4 pr-4">
                {filteredSourceColumns.map(column => (
                  <div key={column} className="flex items-center space-x-4">
                    <span className="flex-1 truncate text-sm">{column}</span>
                    <Select
                      value={mapping[column] || 'none'}
                      onValueChange={(value) => handleMappingChange(column, value === 'none' ? '' : value)}
                    >
                      <SelectTrigger className="w-[200px]">
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
            </ScrollArea>
          </div>
          <div>
            <CardHeader className="px-0 pt-0">
              <CardTitle>Winfakt columns</CardTitle>
            </CardHeader>
            <Input
              type="text"
              placeholder="Search Winfakt columns..."
              value={targetSearch}
              onChange={(e) => setTargetSearch(e.target.value)}
              className="mb-4"
            />
            <ScrollArea className="h-[400px]">
              <div className="space-y-2 pr-4">
                {filteredTargetColumns.map(column => (
                  <div
                    key={column}
                    className={`p-2 rounded-md text-sm ${
                      Object.values(mapping).includes(column)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {column}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ColumnMapper;