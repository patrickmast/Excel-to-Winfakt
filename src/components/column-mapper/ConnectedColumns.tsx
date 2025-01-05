import { CardHeader, CardTitle } from '../ui/card';
import { ArrowRight, X } from 'lucide-react';

interface ConnectedColumnsProps {
  connectedColumns: [string, string][];
  onDisconnect?: (source: string) => void;
}

const ConnectedColumns = ({ connectedColumns, onDisconnect }: ConnectedColumnsProps) => {
  if (connectedColumns.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Connected columns</h3>
      </div>
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
    </div>
  );
};

export default ConnectedColumns;