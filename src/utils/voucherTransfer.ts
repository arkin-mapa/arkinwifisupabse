import { supabase } from "@/integrations/supabase/client";
import type { Purchase } from "@/types/plans";
import type { Database } from "@/types/database.types";

type PurchaseStatus = Database['public']['Tables']['purchases']['Row']['status'];

export async function transferVouchersToClient(purchase: Purchase) {
  if (!purchase.client_id) {
    throw new Error('Client ID is required for voucher transfer');
  }

  // Get the voucher associated with this purchase
  const { data: purchaseData, error: purchaseError } = await supabase
    .from('purchases')
    .select('voucher_id')
    .eq('id', purchase.id)
    .single();

  if (purchaseError || !purchaseData?.voucher_id) {
    console.error('Purchase fetch error:', purchaseError);
    throw new Error('Failed to fetch purchase voucher');
  }

  // Add voucher to client's wallet with explicit status
  const { error: insertError } = await supabase
    .from('voucher_wallet')
    .insert([{
      client_id: purchase.client_id,
      voucher_id: purchaseData.voucher_id,
      status: 'approved' as PurchaseStatus
    }]);

  if (insertError) {
    console.error('Insert error:', insertError);
    throw new Error('Failed to transfer voucher to client wallet');
  }

  return [purchaseData.voucher_id];
}