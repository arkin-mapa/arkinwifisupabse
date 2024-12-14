import { supabase } from "@/integrations/supabase/client";
import type { Purchase, PurchaseStatus } from "@/types/plans";
import type { Database } from "@/types/database.types";

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

  // Create the purchase
  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .insert([{
      customer_name: data.customerName,
      client_id: clientId,
      plan_id: data.planId,
      quantity: data.quantity,
      total_amount: data.totalAmount,
      payment_method: data.paymentMethod,
      status: 'pending'
    }])
    .select()
    .single();

  if (purchaseError || !purchase) {
    console.error('Error creating purchase:', purchaseError);
    throw purchaseError;
  }

  // Create purchase_vouchers entries for each voucher
  const purchaseVouchers = availableVouchers.map(voucher => ({
    purchase_id: purchase.id,
    voucher_id: voucher.id
  }));

  const { error: pvError } = await supabase
    .from('purchase_vouchers')
    .insert(purchaseVouchers);

  if (pvError) {
    console.error('Error creating purchase vouchers:', pvError);
    throw pvError;
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
  // First get the purchase details and its vouchers
  const { data: purchaseVouchers, error: pvError } = await supabase
    .from('purchase_vouchers')
    .select('voucher_id')
    .eq('purchase_id', purchaseId);

  if (pvError) {
    console.error('Error fetching purchase vouchers:', pvError);
    throw pvError;
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

  // If approved, update the voucher_wallet table and mark vouchers as used
  if (status === 'approved' && purchaseVouchers) {
    const { data: purchase } = await supabase
      .from('purchases')
      .select('client_id')
      .eq('id', purchaseId)
      .single();

    if (purchase?.client_id) {
      const walletEntries = purchaseVouchers.map(pv => ({
        client_id: purchase.client_id,
        voucher_id: pv.voucher_id,
        status: status as PurchaseStatus
      }));

      const { error: walletError } = await supabase
        .from('voucher_wallet')
        .insert(walletEntries);

      if (walletError) {
        console.error('Error updating voucher wallet:', walletError);
        throw walletError;
      }

      // Mark vouchers as used
      const { error: voucherError } = await supabase
        .from('vouchers')
        .update({ is_used: true })
        .in('id', purchaseVouchers.map(pv => pv.voucher_id));

      if (voucherError) {
        console.error('Error updating vouchers:', voucherError);
        throw voucherError;
      }
    }
  }
}

export async function cancelPurchase(purchaseId: string): Promise<void> {
  const { error } = await supabase
    .from('purchases')
    .update({ status: 'cancelled' as PurchaseStatus })
    .eq('id', purchaseId);

  if (error) {
    console.error('Error cancelling purchase:', error);
    throw error;
  }
}