import { supabase } from "@/integrations/supabase/client";
import type { Purchase } from "@/types/plans";
import type { Database } from "@/types/database.types";

type PurchaseStatus = Database['public']['Tables']['purchases']['Row']['status'];

export async function transferVouchersToClient(purchase: Purchase) {
  console.log('Starting voucher transfer for purchase:', purchase);

  if (!purchase.client_id) {
    throw new Error('Client ID is required for voucher transfer');
  }

  if (!purchase.plan_id) {
    throw new Error('Plan ID is required for voucher transfer');
  }

  // Get available vouchers for this plan
  const { data: availableVouchers, error: voucherError } = await supabase
    .from('vouchers')
    .select('id')
    .eq('plan_id', purchase.plan_id)
    .eq('is_used', false)
    .limit(purchase.quantity);

  if (voucherError) {
    console.error('Error fetching vouchers:', voucherError);
    throw new Error('Failed to fetch available vouchers');
  }

  console.log('Available vouchers:', availableVouchers);

  if (!availableVouchers || availableVouchers.length < purchase.quantity) {
    throw new Error(`Not enough vouchers available. Need ${purchase.quantity}, but only have ${availableVouchers?.length || 0}`);
  }

  const voucherIds = availableVouchers.map(v => v.id);

  // Start a transaction to update both vouchers and voucher_wallet tables
  const { error: updateError } = await supabase
    .from('vouchers')
    .update({ is_used: true })
    .in('id', voucherIds);

  if (updateError) {
    console.error('Error updating vouchers:', updateError);
    throw new Error('Failed to mark vouchers as used');
  }

  // Add vouchers to client's wallet
  const walletEntries = voucherIds.map(voucherId => ({
    client_id: purchase.client_id,
    voucher_id: voucherId,
    status: 'approved' as PurchaseStatus,
    is_used: true // Mark as used when transferred
  }));

  console.log('Inserting wallet entries:', walletEntries);

  const { error: walletError } = await supabase
    .from('voucher_wallet')
    .insert(walletEntries);

  if (walletError) {
    console.error('Error inserting into voucher_wallet:', walletError);
    throw new Error('Failed to transfer vouchers to client wallet');
  }

  console.log('Voucher transfer completed successfully');
  return voucherIds;
}