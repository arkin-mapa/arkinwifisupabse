import { supabase } from "@/integrations/supabase/client";
import type { Purchase } from "@/types/plans";
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
  const { error: purchaseError } = await supabase
    .from('purchases')
    .insert([{
      customer_name: data.customerName,
      client_id: clientId,
      plan_id: data.planId,
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

export async function updatePurchaseStatus(
  purchaseId: string,
  status: Database['public']['Tables']['purchases']['Row']['status']
): Promise<void> {
  const { error } = await supabase
    .from('purchases')
    .update({ status })
    .eq('id', purchaseId);

  if (error) {
    console.error('Error updating purchase status:', error);
    throw error;
  }
}

export async function deletePurchase(purchaseId: string): Promise<void> {
  const { error } = await supabase
    .from('purchases')
    .delete()
    .eq('id', purchaseId);

  if (error) {
    console.error('Error deleting purchase:', error);
    throw error;
  }
}