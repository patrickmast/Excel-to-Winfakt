import React from 'react';
import { Textarea } from "@/components/ui/textarea";

interface ExpressionEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const ExpressionEditor: React.FC<ExpressionEditorProps> = ({ value, onChange }) => {
  return (
    <div className="h-full flex flex-col">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 font-mono resize-none"
        placeholder="Example: value.toUpperCase() + ' ' + row['other_column']"
      />
    </div>
  );
};

export default ExpressionEditor;