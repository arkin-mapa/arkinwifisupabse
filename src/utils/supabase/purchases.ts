import { supabase } from "@/integrations/supabase/client";
import type { Purchase } from "@/types/plans";
import type { Database } from "@/types/database.types";

export async function createPurchase(data: {
  customerName: string;
  planId: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: Database['public']['Enums']['payment_method'];
}): Promise<void> {
  // Get the current user's ID
  const { data: session } = await supabase.auth.getSession();
  const clientId = session?.session?.user?.id;

  if (!clientId) {
    throw new Error('User must be logged in to make a purchase');
  }

  // Validate payment method is one of the allowed enum values
  const validPaymentMethods = ['cash', 'gcash', 'paymaya', 'credit'] as const;
  if (!validPaymentMethods.includes(data.paymentMethod)) {
    throw new Error('Invalid payment method');
  }

  const { error } = await supabase
    .from('purchases')
    .insert([{
      customer_name: data.customerName,
      plan_id: data.planId,
      client_id: clientId,
      quantity: data.quantity,
      total_amount: data.totalAmount,
      payment_method: data.paymentMethod,
      status: 'pending'
    }]);

  if (error) {
    console.error('Error creating purchase:', error);
    throw error;
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

// Alias for client-side use
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