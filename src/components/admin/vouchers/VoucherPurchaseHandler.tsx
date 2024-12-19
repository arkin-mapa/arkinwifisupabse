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
      console.log('Starting voucher transfer for purchase:', purchase);

      if (!purchase.plan_id) {
        toast.error("Plan ID is required for voucher transfer");
        return;
      }

      // For credit payments, we need to handle the credit transaction first
      if (purchase.paymentMethod === 'credit') {
        console.log('Processing credit payment...');
        
        // Create credit transaction (deduction)
        const { error: creditError } = await supabase
          .from('credits')
          .insert({
            client_id: purchase.client_id,
            amount: purchase.total,
            transaction_type: 'purchase',
            reference_id: purchase.id
          });

        if (creditError) {
          console.error('Credit transaction error:', creditError);
          throw creditError;
        }
        
        console.log('Credit transaction processed successfully');
      }
      
      // Transfer vouchers
      console.log('Transferring vouchers...');
      await transferVouchersToClient(purchase);
      
      // Update purchase status
      const { error: updateError } = await supabase
        .from('purchases')
        .update({ status: 'approved' })
        .eq('id', purchase.id);

      if (updateError) {
        console.error('Purchase status update error:', updateError);
        throw updateError;
      }

      console.log('Purchase approved successfully');
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