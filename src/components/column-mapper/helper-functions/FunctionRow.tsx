import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { showToast } from "@/components/ui/SimpleToast";

interface FunctionRowProps {
  name: string;
  description: string;
}

const FunctionRow = ({ name, description }: FunctionRowProps) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(name).then(() => {
      showToast({
        title: "Function copied to clipboard"
      });
    }).catch(console.error);
  };

  return (
    <TableRow className="last:mb-2">
      <TableCell className="py-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
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
      <TableCell className="py-1">{name}</TableCell>
      <TableCell className="font-mono text-sm py-1">{description}</TableCell>
    </TableRow>
  );
};

export default FunctionRow;