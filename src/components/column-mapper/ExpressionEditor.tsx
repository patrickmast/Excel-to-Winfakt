import React from 'react';
import { Textarea } from "@/components/ui/textarea";

interface ExpressionEditorProps {
  code: string;
  onChange: (value: string) => void;
}

const ExpressionEditor: React.FC<ExpressionEditorProps> = ({ code, onChange }) => {
  return (
    <div className="flex-1 p-4">
      <Textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        className="h-full font-mono resize-none"
        placeholder="Example: value.toUpperCase() + ' ' + col['other_column']"
      />
    </div>
  );
};

export default ExpressionEditor;