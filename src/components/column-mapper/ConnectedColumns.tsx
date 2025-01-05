import { CardHeader, CardTitle } from '../ui/card';
import { ArrowRight } from 'lucide-react';

interface ConnectedColumnsProps {
  connectedColumns: [string, string][];
}

const ConnectedColumns = ({ connectedColumns }: ConnectedColumnsProps) => {
  if (connectedColumns.length === 0) return null;

  return (
    <div>
      <CardHeader className="px-0 pt-0">
        <CardTitle>Connected columns</CardTitle>
      </CardHeader>
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
            <div className="flex-shrink-0">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
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