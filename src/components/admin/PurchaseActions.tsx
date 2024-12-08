import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import type { Purchase, Voucher } from "@/types/plans";

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

      // Get the required number of vouchers
      const assignedVouchers = availableVouchers.slice(0, purchase.quantity).map(v => ({
        ...v,
        isUsed: true
      }));

      // Update voucher pool
      const updatedPool = {
        ...voucherPool,
        [purchase.plan]: planVouchers.map(v => 
          assignedVouchers.find(av => av.id === v.id) ? { ...v, isUsed: true } : v
        )
      };
      localStorage.setItem('vouchers', JSON.stringify(updatedPool));

      // Add vouchers to client wallet
      const clientVouchers = JSON.parse(localStorage.getItem('clientVouchers') || '[]');
      localStorage.setItem('clientVouchers', JSON.stringify([...clientVouchers, ...assignedVouchers]));

      // Update plans with new voucher count
      const plans = JSON.parse(localStorage.getItem('wifiPlans') || '[]');
      const updatedPlans = plans.map(p => 
        p.duration === purchase.plan
          ? { ...p, availableVouchers: (updatedPool[purchase.plan] || []).filter(v => !v.isUsed).length }
          : p
      );
      localStorage.setItem('wifiPlans', JSON.stringify(updatedPlans));

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