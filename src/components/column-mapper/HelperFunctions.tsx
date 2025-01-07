import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";

const helperFunctions = [
  {
    name: "value.toUpperCase()",
    description: "Convert to uppercase",
  },
  {
    name: "value.toLowerCase()",
    description: "Convert to lowercase",
  },
  {
    name: "value.trim()",
    description: "Remove whitespace from both ends",
  },
  {
    name: "value.substring(start, end)",
    description: "Extract part of string",
  },
  {
    name: "value.replace(search, replace)",
    description: "Replace text",
  },
  {
    name: "parseFloat(value)",
    description: "Convert to decimal number",
  },
  {
    name: "parseInt(value)",
    description: "Convert to integer",
  },
  {
    name: "Number(value)",
    description: "Convert string to number",
  },
  {
    name: "Number(value).toFixed(2)",
    description: "Format with 2 decimals",
  },
  {
    name: "Math.round(value)",
    description: "Round to nearest integer",
  },
  {
    name: "Math.abs(value)",
    description: "Get absolute value",
  },
  {
    name: "new Date(value).toLocaleDateString()",
    description: "Format as date",
  },
  {
    name: "new Date(value).toISOString()",
    description: "Convert to ISO format",
  }
];

const HelperFunctions: React.FC = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        description: "Function copied to clipboard",
        duration: 2000,
      });
    }).catch(console.error);
  };

  return (
    <div className="h-[350px] flex-1">
      <ScrollArea className="h-full border rounded-md">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Function</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {helperFunctions.map((func, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(func.name)}
                    className="h-8 w-8"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TableCell>
                <TableCell className="font-mono">{func.name}</TableCell>
                <TableCell>{func.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default HelperFunctions;