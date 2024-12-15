import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Purchase } from "@/types/plans";
import type { Database } from "@/types/database.types";

type PurchaseStatus = Database['public']['Tables']['purchases']['Row']['status'];

export async function transferVouchersToClient(purchase: Purchase) {
  if (!purchase.client_id) {
    throw new Error('Client ID is required for voucher transfer');
  }

  const { data: availableVouchers, error: fetchError } = await supabase
    .from('vouchers')
    .select('id')
    .eq('plan_id', purchase.plan_id)
    .eq('is_used', false)
    .limit(purchase.quantity);

  if (fetchError || !availableVouchers) {
    console.error('Fetch error:', fetchError);
    throw new Error('Failed to fetch available vouchers');
  }

  if (availableVouchers.length < purchase.quantity) {
    throw new Error(`Not enough vouchers available. Need ${purchase.quantity}, but only have ${availableVouchers.length}`);
  }

  const voucherIds = availableVouchers.map(v => v.id);
  
  // Mark vouchers as used
  const { error: updateError } = await supabase
    .from('vouchers')
    .update({ is_used: true })
    .in('id', voucherIds);

  if (updateError) {
    console.error('Update error:', updateError);
    throw new Error('Failed to update vouchers');
  }

  // Add vouchers to client's wallet with explicit status
  const walletEntries = voucherIds.map(voucherId => ({
    client_id: purchase.client_id,
    voucher_id: voucherId,
    status: 'approved' as PurchaseStatus
  }));

  const { error: insertError } = await supabase
    .from('voucher_wallet')
    .insert(walletEntries);

  if (insertError) {
    console.error('Insert error:', insertError);
    throw new Error('Failed to transfer vouchers to client wallet');
  }

  return voucherIds;
}