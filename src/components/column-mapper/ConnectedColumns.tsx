import { ArrowRight, X } from 'lucide-react';
import { Button } from '../ui/button';

interface ConnectedColumnsProps {
  connectedColumns: [string, string][];
  onDisconnect?: (source: string) => void;
  onExport?: () => void;
}

const ConnectedColumns = ({ connectedColumns, onDisconnect, onExport }: ConnectedColumnsProps) => {
  return (
    <div className="p-2">
      <div className="flex items-center justify-between h-[36px]">
        <h3 className="text-xl font-semibold">Connected columns</h3>
        {onExport && (
          <Button 
            onClick={onExport}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={connectedColumns.length === 0}
          >
            Export CSV
          </Button>
        )}
      </div>
      {connectedColumns.length > 0 && (
        <div className="w-full space-y-2 mt-4">
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
      )}
    </div>
  );
};

export default ConnectedColumns;