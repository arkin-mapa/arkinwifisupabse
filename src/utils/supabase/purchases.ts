import { supabase } from "@/integrations/supabase/client";
import type { Purchase } from "@/types/plans";
import type { Database } from "@/types/database.types";

type PurchaseStatus = Database['public']['Tables']['purchases']['Row']['status'];

export async function createPurchase(data: {
  customerName: string;
  planId: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: Database['public']['Tables']['purchases']['Row']['payment_method'];
}): Promise<void> {
  const { data: session } = await supabase.auth.getSession();
  const clientId = session?.session?.user?.id;

  if (!clientId) {
    throw new Error('User must be logged in to make a purchase');
  }

  // First, get available vouchers for this plan
  const { data: availableVouchers, error: voucherError } = await supabase
    .from('vouchers')
    .select('id')
    .eq('plan_id', data.planId)
    .eq('is_used', false)
    .limit(data.quantity);

  if (voucherError) {
    console.error('Error fetching vouchers:', voucherError);
    throw voucherError;
  }

  if (!availableVouchers || availableVouchers.length < data.quantity) {
    throw new Error('Not enough vouchers available');
  }

  // Create the purchase with the first voucher
  const { error: purchaseError } = await supabase
    .from('purchases')
    .insert([{
      customer_name: data.customerName,
      client_id: clientId,
      plan_id: data.planId,
      voucher_id: availableVouchers[0].id,
      quantity: data.quantity,
      total_amount: data.totalAmount,
      payment_method: data.paymentMethod,
      status: 'pending'
    }]);

  if (purchaseError) {
    console.error('Error creating purchase:', purchaseError);
    throw purchaseError;
  }
}

export async function fetchPurchases(): Promise<Purchase[]> {
  const { data: purchases, error } = await supabase
    .from('purchases')
    .select(`
      *,
      plans (
        duration
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching purchases:', error);
    throw error;
  }

  return (purchases || []).map(p => ({
    id: p.id,
    date: new Date(p.created_at).toLocaleDateString(),
    customerName: p.customer_name,
    client_id: p.client_id || '',
    plan_id: p.plan_id || '',
    plan: p.plans?.duration || '',
    quantity: p.quantity,
    total: Number(p.total_amount),
    paymentMethod: p.payment_method,
    status: p.status
  }));
}

export const fetchClientPurchases = fetchPurchases;

export async function updatePurchaseStatus(
  purchaseId: string,
  status: PurchaseStatus
): Promise<void> {
  // First get the purchase details
  const { data: purchase, error: fetchError } = await supabase
    .from('purchases')
    .select('*')
    .eq('id', purchaseId)
    .single();

  if (fetchError) {
    console.error('Error fetching purchase:', fetchError);
    throw fetchError;
  }

  // Update the purchase status
  const { error: updateError } = await supabase
    .from('purchases')
    .update({ status })
    .eq('id', purchaseId);

  if (updateError) {
    console.error('Error updating purchase status:', updateError);
    throw updateError;
  }

  // If approved, update the voucher_wallet table and mark voucher as used
  if (status === 'approved' && purchase?.voucher_id && purchase?.client_id) {
    const { error: walletError } = await supabase
      .from('voucher_wallet')
      .insert([{
        client_id: purchase.client_id,
        voucher_id: purchase.voucher_id,
        status: 'approved'
      }]);

    if (walletError) {
      console.error('Error updating voucher wallet:', walletError);
      throw walletError;
    }

    const { error: voucherError } = await supabase
      .from('vouchers')
      .update({ is_used: true })
      .eq('id', purchase.voucher_id);

    if (voucherError) {
      console.error('Error updating voucher:', voucherError);
      throw voucherError;
    }
  }
}

export async function cancelPurchase(purchaseId: string): Promise<void> {
  const { error } = await supabase
    .from('purchases')
    .update({ status: 'cancelled' })
    .eq('id', purchaseId);

  if (error) {
    console.error('Error cancelling purchase:', error);
    throw error;
  }
}