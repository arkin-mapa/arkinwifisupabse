import { Button } from "@/components/ui/button";
import { Copy, Trash2, Printer } from "lucide-react";
import { toast } from "sonner";
import type { Voucher } from "@/types/plans";

interface VoucherActionsProps {
  voucher: Voucher;
  onDelete: (id: string) => void;
  onPrint: (voucher: Voucher) => void;
}

export const VoucherActions = ({ voucher, onDelete, onPrint }: VoucherActionsProps) => {
  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Voucher code copied!");
    } catch (err) {
      toast.error("Failed to copy code. Please try again.");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => copyToClipboard(voucher.code)}
        className="text-gray-600 hover:bg-gray-100"
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onPrint(voucher)}
        className="text-gray-600 hover:bg-gray-100"
      >
        <Printer className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onDelete(voucher.id)}
        className="text-red-500 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};