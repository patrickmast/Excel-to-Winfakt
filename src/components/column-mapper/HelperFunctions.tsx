import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { helperFunctions } from './helper-functions/helperFunctionsData';
import FunctionRow from './helper-functions/FunctionRow';

const HelperFunctions: React.FC = () => {
  return (
    <div className="h-[396px] px-4">
      <ScrollArea className="h-full rounded-md border">
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
              <FunctionRow 
                key={index}
                name={func.name}
                description={func.description}
              />
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default HelperFunctions;