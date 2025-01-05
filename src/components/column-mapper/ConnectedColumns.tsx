import { ArrowRight, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';

interface ConnectedColumnsProps {
  connectedColumns: [string, string][];
  onDisconnect?: (source: string) => void;
  onExport?: () => void;
}

const ConnectedColumns = ({ connectedColumns, onDisconnect, onExport }: ConnectedColumnsProps) => {
  if (connectedColumns.length === 0) return null;

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <h3 className="text-xl font-semibold">Connected columns</h3>
        {onExport && (
          <Button 
            onClick={onExport}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Export CSV
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="w-full space-y-2">
          {connectedColumns.map(([source, target]) => (
            <div 
              key={source} 
              className="flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="bg-[#F0FEF5] p-4 rounded-md border border-[#BBF7D0]">
                  <p className="truncate text-sm font-medium">{source}</p>
                </div>
              </div>
              <div className="flex-shrink-0 group cursor-pointer" onClick={() => onDisconnect?.(source)}>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:hidden" />
                <X className="h-4 w-4 text-red-500 hidden group-hover:block" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-[#F0FEF5] p-4 rounded-md border border-[#BBF7D0]">
                  <p className="truncate text-sm font-medium">{target}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectedColumns;