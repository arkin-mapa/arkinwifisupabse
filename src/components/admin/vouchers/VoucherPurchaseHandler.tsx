import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { transferVouchersToClient } from "@/utils/voucherTransfer";
import type { Purchase } from "@/types/plans";
import { supabase } from "@/integrations/supabase/client";

interface VoucherPurchaseHandlerProps {
  purchase: Purchase;
  onSuccess: () => void;
  onReject: (id: string) => void;
}

export const VoucherPurchaseHandler = ({ 
  purchase, 
  onSuccess, 
  onReject 
}: VoucherPurchaseHandlerProps) => {
  const handleVoucherTransfer = async () => {
    try {
      if (!purchase.plan_id) {
        toast.error("Plan ID is required for voucher transfer");
        return;
      }
      
      await transferVouchersToClient(purchase);
      
      const { error: updateError } = await supabase
        .from('purchases')
        .update({ status: 'approved' })
        .eq('id', purchase.id);

      if (updateError) throw updateError;

      onSuccess();
      toast.success("Purchase approved and vouchers transferred");
    } catch (error) {
      console.error('Error approving voucher purchase:', error);
      toast.error("Failed to approve voucher purchase");
    }
  };

  return (
    <div className="flex gap-2 mt-2">
      <Button
        size="sm"
        className="h-7 text-xs flex-1 bg-green-500 hover:bg-green-600"
        onClick={handleVoucherTransfer}
      >
        <Check className="w-3 h-3 mr-1" />
        Approve
      </Button>
      <Button
        size="sm"
        variant="destructive"
        className="h-7 text-xs flex-1"
        onClick={() => onReject(purchase.id)}
      >
        <X className="w-3 h-3 mr-1" />
        Reject
      </Button>
    </div>
  );
};