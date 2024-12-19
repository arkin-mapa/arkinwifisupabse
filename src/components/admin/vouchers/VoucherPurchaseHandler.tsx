import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Purchase } from "@/types/plans";

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

      // Get available vouchers first
      const { data: availableVouchers, error: voucherError } = await supabase
        .from('vouchers')
        .select('id, code, plan_id')
        .eq('plan_id', purchase.plan_id)
        .eq('is_used', false)
        .limit(purchase.quantity);

      if (voucherError) {
        console.error('Error fetching vouchers:', voucherError);
        throw voucherError;
      }

      if (!availableVouchers || availableVouchers.length < purchase.quantity) {
        throw new Error('Not enough vouchers available');
      }

      const voucherIds = availableVouchers.map(v => v.id);
      console.log('Selected voucher IDs:', voucherIds);

      // For credit payments
      if (purchase.paymentMethod === 'credit') {
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

        console.log('Credit transaction successful, proceeding with voucher transfer');

        // Use the credit payment voucher transfer function
        const { error: transferError } = await supabase.rpc(
          'handle_credit_payment_voucher_transfer',
          {
            p_client_id: purchase.client_id,
            p_voucher_ids: voucherIds
          }
        );

        if (transferError) {
          console.error('Transfer error:', transferError);
          throw transferError;
        }
      } else {
        // For non-credit payments, use the regular transfer function
        const { error: transferError } = await supabase.rpc(
          'transfer_vouchers_to_client',
          {
            p_client_id: purchase.client_id,
            p_voucher_ids: voucherIds
          }
        );

        if (transferError) {
          console.error('Transfer error:', transferError);
          throw transferError;
        }

        // For non-credit payments, we need to explicitly mark vouchers as used
        const { error: updateError } = await supabase
          .from('vouchers')
          .update({ is_used: true })
          .in('id', voucherIds);

        if (updateError) {
          console.error('Error updating voucher status:', updateError);
          throw updateError;
        }
      }
      
      // Update purchase status
      const { error: updateError } = await supabase
        .from('purchases')
        .update({ status: 'approved' })
        .eq('id', purchase.id);

      if (updateError) {
        console.error('Error updating purchase status:', updateError);
        throw updateError;
      }

      console.log('Voucher transfer completed successfully');
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