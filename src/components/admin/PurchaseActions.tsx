import { Button } from "@/components/ui/button";
import { Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Purchase, Voucher } from "@/types/plans";

interface PurchaseActionsProps {
  purchaseId: number;
  status: string;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onDelete: (id: number) => void;
}

const PurchaseActions = ({ purchaseId, status, onApprove, onReject, onDelete }: PurchaseActionsProps) => {
  const handleApprove = async (id: number) => {
    try {
      // Get the purchase details from localStorage
      const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
      const purchase = purchases.find((p: Purchase) => p.id === id);
      
      if (!purchase) {
        toast.error("Purchase not found");
        return;
      }

      // Get the voucher pool
      const voucherPool = JSON.parse(localStorage.getItem('vouchers') || '{}');
      const planVouchers = voucherPool[purchase.plan] || [];
      const availableVouchers = planVouchers.filter(v => !v.isUsed);

      if (availableVouchers.length < purchase.quantity) {
        toast.error(`Not enough vouchers available. Need ${purchase.quantity}, but only have ${availableVouchers.length}`);
        return;
      }

      // Select vouchers to transfer and remove them from pool
      const vouchersToTransfer = availableVouchers.slice(0, purchase.quantity);
      const remainingVouchers = planVouchers.filter(voucher => 
        !vouchersToTransfer.some(transferVoucher => transferVoucher.id === voucher.id)
      );

      // Update voucher pool without the transferred vouchers
      const updatedVoucherPool = {
        ...voucherPool,
        [purchase.plan]: remainingVouchers
      };
      localStorage.setItem('vouchers', JSON.stringify(updatedVoucherPool));

      // Add vouchers to client wallet
      const clientVouchers = JSON.parse(localStorage.getItem('clientVouchers') || '[]');
      localStorage.setItem('clientVouchers', JSON.stringify([...clientVouchers, ...vouchersToTransfer]));

      // Update plan's available voucher count
      const plans = JSON.parse(localStorage.getItem('wifiPlans') || '[]');
      const updatedPlans = plans.map(p => 
        p.duration === purchase.plan
          ? { ...p, availableVouchers: remainingVouchers.length }
          : p
      );
      localStorage.setItem('wifiPlans', JSON.stringify(updatedPlans));

      // Update purchase status
      onApprove(id);
      
      toast.success("Vouchers successfully transferred to client wallet");
    } catch (error) {
      console.error('Error during voucher transfer:', error);
      toast.error("Failed to transfer vouchers. Please try again.");
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