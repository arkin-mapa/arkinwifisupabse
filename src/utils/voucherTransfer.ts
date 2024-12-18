import { supabase } from "@/integrations/supabase/client";
import type { Purchase } from "@/types/plans";
import type { Database } from "@/types/database.types";

type PurchaseStatus = Database['public']['Tables']['purchases']['Row']['status'];

export async function transferVouchersToClient(purchase: Purchase) {
  console.log('Starting voucher transfer for purchase:', purchase);

  if (!purchase.client_id) {
    throw new Error('Client ID is required for voucher transfer');
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

  // Add vouchers to client's wallet
  const walletEntries = availableVouchers.map(voucher => ({
    client_id: purchase.client_id,
    voucher_id: voucher.id,
    status: 'approved' as PurchaseStatus
  }));

  console.log('Inserting wallet entries:', walletEntries);

  const { error: walletError } = await supabase
    .from('voucher_wallet')
    .insert(walletEntries);

  if (walletError) {
    console.error('Error adding to wallet:', walletError);
    throw new Error('Failed to add vouchers to client wallet');
  }

  // The trigger we created will automatically delete the vouchers from the vouchers table
  // after they are inserted into the voucher_wallet table

  console.log('Voucher transfer completed successfully');
  return availableVouchers.map(v => v.id);
}