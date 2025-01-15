import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
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
    <div className="flex-1 p-4 flex">
      <div className="flex flex-1 min-h-[80px] rounded-md border border-input bg-background">
        <ScrollArea className="flex-1 pb-2">
          <div className="pt-1">
            <Table>
              <TableBody>
                {sourceColumns.map((col) => (
                  <TableRow key={col}>
                    <TableCell className="py-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onColumnSelect(col)}
                              className="h-6 w-6"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="py-1">{col}</TableCell>
                    <TableCell className="font-mono text-sm py-1">{getFirstValue(col)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ColumnSelector;