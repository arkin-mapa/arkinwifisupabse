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
        throw new Error(`Not enough vouchers available. Need ${purchase.quantity}, but only have ${availableVouchers?.length || 0}`);
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

        // Create copies of vouchers and add them to client's wallet
        for (const voucherId of voucherIds) {
          const { data: originalVoucher } = await supabase
            .from('vouchers')
            .select('code, plan_id')
            .eq('id', voucherId)
            .single();

          if (originalVoucher) {
            // Create a copy of the voucher
            const { data: newVoucher, error: copyError } = await supabase
              .from('vouchers')
              .insert({
                code: originalVoucher.code,
                plan_id: originalVoucher.plan_id,
                is_copy: true,
                original_voucher_id: voucherId
              })
              .select()
              .single();

            if (copyError) {
              console.error('Error creating voucher copy:', copyError);
              throw copyError;
            }

            // Add to client's wallet
            const { error: walletError } = await supabase
              .from('voucher_wallet')
              .insert({
                client_id: purchase.client_id,
                voucher_id: newVoucher.id,
                status: 'approved'
              });

            if (walletError) {
              console.error('Error adding to wallet:', walletError);
              throw walletError;
            }

            // Delete original voucher
            const { error: deleteError } = await supabase
              .from('vouchers')
              .delete()
              .eq('id', voucherId);

            if (deleteError) {
              console.error('Error deleting original voucher:', deleteError);
              throw deleteError;
            }
          }
        }
      } else {
        // For non-credit payments, transfer vouchers directly and delete originals
        // First add to client's wallet
        const { error: transferError } = await supabase
          .from('voucher_wallet')
          .insert(
            voucherIds.map(id => ({
              client_id: purchase.client_id,
              voucher_id: id,
              status: 'approved' as const
            }))
          );

        if (transferError) {
          console.error('Transfer error:', transferError);
          throw transferError;
        }

        // Then delete original vouchers
        const { error: deleteError } = await supabase
          .from('vouchers')
          .delete()
          .in('id', voucherIds);

        if (deleteError) {
          console.error('Error deleting vouchers:', deleteError);
          throw deleteError;
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