import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/types/database.types";
import type { Purchase } from "@/types/plans";

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

  if (error) throw error;

  return purchases.map(p => ({
    id: p.id,
    date: new Date(p.created_at).toLocaleDateString(),
    customerName: p.customer_name,
    plan: p.plans?.duration || '',
    quantity: p.quantity,
    total: Number(p.total_amount),
    paymentMethod: p.payment_method,
    status: p.status
  }));
}

export async function createPurchase(purchase: {
  customerName: string;
  planId: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: Database["public"]["Tables"]["purchases"]["Row"]["payment_method"];
}): Promise<void> {
  const { error } = await supabase
    .from('purchases')
    .insert([{
      customer_name: purchase.customerName,
      plan_id: purchase.planId,
      quantity: purchase.quantity,
      total_amount: purchase.totalAmount,
      payment_method: purchase.paymentMethod,
      status: 'pending'
    }]);

  if (error) throw error;
}

export async function updatePurchaseStatus(
  purchaseId: string,
  status: Database["public"]["Tables"]["purchases"]["Row"]["status"]
): Promise<void> {
  const { error } = await supabase
    .from('purchases')
    .update({ status })
    .eq('id', purchaseId);

  if (error) throw error;
}

export async function deletePurchase(purchaseId: string): Promise<void> {
  const { error } = await supabase
    .from('purchases')
    .delete()
    .eq('id', purchaseId);

  if (error) throw error;
}

export async function cancelPurchase(purchaseId: string): Promise<void> {
  const { error } = await supabase
    .from('purchases')
    .update({ status: 'cancelled' })
    .eq('id', purchaseId);

  if (error) throw error;
}

export async function fetchClientPurchases(): Promise<Purchase[]> {
  const { data: purchases, error } = await supabase
    .from('purchases')
    .select(`
      *,
      plans (
        duration
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return purchases.map(p => ({
    id: p.id,
    date: new Date(p.created_at).toLocaleDateString(),
    customerName: p.customer_name,
    plan: p.plans?.duration || '',
    quantity: p.quantity,
    total: Number(p.total_amount),
    paymentMethod: p.payment_method,
    status: p.status
  }));
}