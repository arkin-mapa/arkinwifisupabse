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
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="bg-green-500 hover:bg-green-600 transition-colors"
          onClick={() => handleApprove(purchaseId)}
        >
          <Check className="w-4 h-4 mr-1" />
          Approve
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="transition-colors"
          onClick={() => onReject(purchaseId)}
        >
          <X className="w-4 h-4 mr-1" />
          Reject
        </Button>
      </div>
    );
  }

  if (status === "approved" || status === "rejected") {
    return (
      <Button
        size="sm"
        variant="ghost"
        className="text-red-500 hover:text-red-600 hover:bg-red-50"
        onClick={() => onDelete(purchaseId)}
      >
        <Trash2 className="w-4 h-4 mr-1" />
        Delete
      </Button>
    );
  }

  return null;
};

export default PurchaseActions;