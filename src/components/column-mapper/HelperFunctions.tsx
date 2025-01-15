import React from 'react';
import { Table, TableBody, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { helperFunctions } from './helper-functions/helperFunctionsData';
import FunctionRow from './helper-functions/FunctionRow';

const HelperFunctions: React.FC = () => {
  return (
    <div className="flex-1 p-4 flex">
      <div className="flex flex-1 min-h-[80px] rounded-md border border-input bg-background">
        <ScrollArea className="flex-1 pb-2">
          <div className="pt-1">
            <Table>
              <TableBody>
                {helperFunctions.map((func, index) => (
                  <FunctionRow
                    key={index}
                    name={func.name}
                    description={func.description}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default HelperFunctions;