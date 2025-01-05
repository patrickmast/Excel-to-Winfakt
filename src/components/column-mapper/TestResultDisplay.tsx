import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface TestResultDisplayProps {
  result: string | null;
  error: string | null;
}

const TestResultDisplay: React.FC<TestResultDisplayProps> = ({ result, error }) => {
  if (!result && !error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>Click the "Test" button to evaluate your expression</p>
      </div>
    );
  }

  return (
    <div className="p-4 h-full">
      {error ? (
        <div className="flex items-start space-x-2 text-destructive">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div>
            <h4 className="font-medium">Error evaluating expression</h4>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-start space-x-2 text-green-600">
          <CheckCircle2 className="h-5 w-5 mt-0.5" />
          <div>
            <h4 className="font-medium">Expression is valid</h4>
            <p className="mt-1">Result: {result}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResultDisplay;