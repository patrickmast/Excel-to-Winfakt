import React from 'react';
import { Textarea } from "@/components/ui/textarea";

const helperFunctionsMarkdown = `String Operations
value.toUpperCase()        // Convert to uppercase
value.toLowerCase()        // Convert to lowercase
value.trim()              // Remove whitespace from both ends
value.substring(start, end) // Extract part of string
value.replace(search, replace) // Replace text

Number Operations
parseFloat(value)         // Convert to decimal number
parseInt(value)           // Convert to integer
Number(value)            // Convert string to number
Number(value).toFixed(2)  // Format with 2 decimals
Math.round(value)         // Round to nearest integer
Math.abs(value)          // Get absolute value

Date Operations
new Date(value).toLocaleDateString() // Format as date
new Date(value).toISOString()        // Convert to ISO format`;

const HelperFunctions: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <Textarea
        value={helperFunctionsMarkdown}
        className="flex-1 font-mono resize-none"
        readOnly
      />
    </div>
  );
};

export default HelperFunctions;