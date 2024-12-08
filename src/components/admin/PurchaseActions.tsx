import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { assignVouchersToClient } from "@/utils/purchaseUtils";

interface PurchaseActionsProps {
  purchaseId: number;
  status: string;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

const PurchaseActions = ({ purchaseId, status, onApprove, onReject }: PurchaseActionsProps) => {
  const handleApprove = async (id: number) => {
    try {
      // Get the purchase details from localStorage
      const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
      const purchase = purchases.find((p: any) => p.id === id);
      
      if (!purchase) {
        toast.error("Purchase not found");
        return;
      }

      // Get the voucher pool
      const voucherPool = JSON.parse(localStorage.getItem('voucherPool') || '{}');
      
      // Assign vouchers to client
      const { assignedVouchers, remainingPool } = assignVouchersToClient(
        voucherPool,
        purchase.plan,
        purchase.quantity
      );

      // Update voucher pool in localStorage
      localStorage.setItem('voucherPool', JSON.stringify(remainingPool));

      // Add vouchers to client wallet
      const clientVouchers = JSON.parse(localStorage.getItem('clientVouchers') || '[]');
      const updatedClientVouchers = [...clientVouchers, ...assignedVouchers];
      localStorage.setItem('clientVouchers', JSON.stringify(updatedClientVouchers));

      // Call the original onApprove function
      onApprove(id);
      
      toast.success("Purchase approved and vouchers assigned successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to assign vouchers");
    }
  };

  if (status !== "pending") return null;

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
};

export default PurchaseActions;