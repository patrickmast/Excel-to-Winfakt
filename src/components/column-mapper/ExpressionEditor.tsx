import React from 'react';
import { Textarea } from "@/components/ui/textarea";

interface ExpressionEditorProps {
  value: string;
  onChange: (value: string) => void;
  result: string | null;
  error: string | null;
}

const ExpressionEditor: React.FC<ExpressionEditorProps> = ({ value, onChange, result, error }) => {
  const displayValue = (result || error) ? (error || result || '') : value;
  
  return (
    <div className="h-full flex flex-col">
      <Textarea
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        className={`flex-1 font-mono resize-none ${error ? 'text-destructive' : ''} ${result ? 'text-success' : ''}`}
        placeholder="Example: value.toUpperCase() + ' ' + row['other_column']"
        readOnly={result !== null || error !== null}
      />
    </div>
  );
};

export default ExpressionEditor;