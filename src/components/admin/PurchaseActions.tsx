import { Button } from "@/components/ui/button";
import { Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { transferVouchersToClient } from "@/utils/voucherManagement";
import type { Purchase } from "@/types/plans";

interface PurchaseActionsProps {
  purchaseId: number;
  status: string;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onDelete: (id: number) => void;
}

const PurchaseActions = ({ 
  purchaseId, 
  status, 
  onApprove, 
  onReject, 
  onDelete 
}: PurchaseActionsProps) => {
  const handleApprove = async (id: number) => {
    try {
      // Get the purchase details
      const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
      const purchase = purchases.find((p: Purchase) => p.id === id);
      
      if (!purchase) {
        toast.error("Purchase not found");
        return;
      }

      // Transfer vouchers
      transferVouchersToClient(purchase);
      
      // Update purchase status
      onApprove(id);
      toast.success("Vouchers successfully transferred to client wallet");
    } catch (error) {
      console.error('Error during voucher transfer:', error);
      toast.error(error instanceof Error ? error.message : "Failed to transfer vouchers. Please try again.");
    }
  };

  if (status === "pending") {
    return (
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          className="h-7 w-7 bg-green-500 hover:bg-green-600 transition-colors"
          onClick={() => handleApprove(purchaseId)}
          title="Approve"
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          className="h-7 w-7 transition-colors"
          onClick={() => onReject(purchaseId)}
          title="Reject"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  if (status === "approved" || status === "rejected" || status === "cancelled") {
    return (
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
        onClick={() => onDelete(purchaseId)}
        title="Delete"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    );
  }

  return null;
};

export default PurchaseActions;