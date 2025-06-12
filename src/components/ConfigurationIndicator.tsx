import { Badge } from './ui/badge';
import { useUrlParams } from '@/hooks/use-url-params';

interface ConfigurationIndicatorProps {
  className?: string;
}

const ConfigurationIndicator = ({ className = '' }: ConfigurationIndicatorProps) => {
  const { dossier, config } = useUrlParams();

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
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            {config}
          </Badge>
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