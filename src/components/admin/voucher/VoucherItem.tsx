import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Voucher } from "@/types/plans";

interface VoucherItemProps {
  voucher: Voucher;
  onDelete: (id: string) => void;
}

export const VoucherItem = ({ voucher, onDelete }: VoucherItemProps) => {
  return (
    <div className="relative group">
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={voucher.isUsed ? "secondary" : "default"}
            className={`w-full justify-between py-2 px-3 font-mono text-xs ${
              voucher.isUsed ? 'bg-muted line-through' : ''
            }`}
          >
            <span className="truncate">{voucher.code}</span>
            {voucher.isUsed && (
              <AlertCircle className="h-3 w-3 text-yellow-500 ml-1" />
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{voucher.isUsed ? 'This voucher has been used' : 'Available voucher'}</p>
        </TooltipContent>
      </Tooltip>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onDelete(voucher.id)}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
};