import { Badge } from './ui/badge';
import { useUrlParams } from '@/hooks/use-url-params';

interface ConfigurationIndicatorProps {
  className?: string;
}

const ConfigurationIndicator = ({ className = '' }: ConfigurationIndicatorProps) => {
  const { dossier, config } = useUrlParams();

  const truncateConfigName = (name: string) => {
    if (name.length <= 30) return name;
    return name.substring(0, 30) + '...';
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Dossier:</span>
        <Badge variant="secondary" className="font-mono">
          {dossier}
        </Badge>
      </div>
      
      {config && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">Configuratie:</span>
          <div className="relative group">
            <span 
              className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800 cursor-default"
            >
              {truncateConfigName(config)}
            </span>
            <div className="absolute z-50 invisible group-hover:visible group-hover:delay-300 bg-gray-900 text-white text-xs rounded py-1 px-2 bottom-full left-1/2 transform -translate-x-1/2 mb-1 whitespace-nowrap pointer-events-none">
              {config}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}
      
      {!config && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground italic">Geen configuratie geladen</span>
        </div>
      )}
    </div>
  );
};

export default ConfigurationIndicator;