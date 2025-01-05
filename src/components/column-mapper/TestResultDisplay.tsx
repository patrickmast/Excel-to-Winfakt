import React from 'react';

interface TestResultDisplayProps {
  result: string | null;
  error: string | null;
}

const TestResultDisplay: React.FC<TestResultDisplayProps> = ({ result, error }) => {
  if (!result && !error) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Click the Test button to see the result
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center">
      <div className={error ? "text-destructive" : "text-foreground"}>
        {error || result}
      </div>
    </div>
  );
};

export default TestResultDisplay;