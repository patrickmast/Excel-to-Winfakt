import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";

interface FunctionRowProps {
  name: string;
  description: string;
}

const FunctionRow = ({ name, description }: FunctionRowProps) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(name).then(() => {
      toast({
        description: "Function copied to clipboard",
        duration: 2000,
      });
    }).catch(console.error);
  };

  return (
    <TableRow>
      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
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
      <TableCell className="font-mono">{name}</TableCell>
      <TableCell>{description}</TableCell>
    </TableRow>
  );
};

export default FunctionRow;