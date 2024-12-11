import { Button } from "@/components/ui/button";
import { Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { transferVouchersToClient } from "@/utils/voucherTransfer";
import type { Purchase } from "@/types/plans";

interface PurchaseActionsProps {
  purchase: Purchase;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}

const PurchaseActions = ({ 
  purchase,
  onApprove, 
  onReject, 
  onDelete 
}: PurchaseActionsProps) => {
  const handleApprove = async () => {
    try {
      await transferVouchersToClient(purchase);
      onApprove(purchase.id);
      toast.success("Vouchers successfully transferred to client wallet");
    } catch (error) {
      console.error('Error during voucher transfer:', error);
      toast.error(error instanceof Error ? error.message : "Failed to transfer vouchers");
    }
  };

  if (purchase.status === "pending") {
    return (
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          className="h-7 w-7 bg-green-500 hover:bg-green-600 transition-colors"
          onClick={handleApprove}
          title="Approve"
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          className="h-7 w-7 transition-colors"
          onClick={() => onReject(purchase.id)}
          title="Reject"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  if (["approved", "rejected", "cancelled"].includes(purchase.status)) {
    return (
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
        onClick={() => onDelete(purchase.id)}
        title="Delete"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    );
  }

  return null;
};

export default PurchaseActions;