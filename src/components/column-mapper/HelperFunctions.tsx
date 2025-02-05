import React from 'react';
import { Table, TableBody, TableRow } from "@/components/ui/table";
import { helperFunctions } from './helper-functions/helperFunctionsData';
import FunctionRow from './helper-functions/FunctionRow';

const HelperFunctions: React.FC = () => {
  return (
    <div className="p-4">
      <div className="rounded-md border border-input bg-background">
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
    </div>
  );
};

export default HelperFunctions;