import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ColumnSelectorProps {
  sourceColumns: string[];
  sourceData: any[];
  onColumnSelect: (columnName: string) => void;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  sourceColumns,
  sourceData,
  onColumnSelect,
}) => {
  const getFirstValue = (columnName: string) => {
    if (sourceData && sourceData.length > 0) {
      return String(sourceData[0][columnName] ?? '');
    }
    return '';
  };

  return (
    <div className="h-[380px] px-4 mb-4">
      <ScrollArea className="h-full rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Column Name</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sourceColumns.map((col) => (
              <TableRow key={col}>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onColumnSelect(col)}
                          className="h-8 w-8"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>{col}</TableCell>
                <TableCell className="font-mono text-sm">{getFirstValue(col)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default ColumnSelector;