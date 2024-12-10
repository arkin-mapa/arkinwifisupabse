import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/types/database.types";
import type { Plan, Voucher, Purchase } from "@/types/plans";

export async function fetchClientPlans(): Promise<Plan[]> {
  const { data: plans, error } = await supabase
    .from('plans')
    .select(`
      id,
      duration,
      price,
      vouchers (
        id,
        is_used
      )
    `)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }

  return plans.map(plan => ({
    id: plan.id,
    duration: plan.duration,
    price: Number(plan.price),
    availableVouchers: plan.vouchers?.filter(v => !v.is_used).length ?? 0
  }));
}

export async function createPurchase(purchase: {
  customerName: string;
  planId: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: Database['public']['Tables']['purchases']['Row']['payment_method'];
}) {
  const { data, error } = await supabase
    .from('purchases')
    .insert([{
      customer_name: purchase.customerName,
      plan_id: purchase.planId,
      quantity: purchase.quantity,
      total_amount: purchase.totalAmount,
      payment_method: purchase.paymentMethod,
      status: 'pending'
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating purchase:', error);
    throw error;
  }

  return data;
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

  if (error) {
    console.error('Error fetching purchases:', error);
    throw error;
  }

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

export async function cancelPurchase(purchaseId: string) {
  const { error } = await supabase
    .from('purchases')
    .update({ status: 'cancelled' })
    .eq('id', purchaseId);

  if (error) {
    console.error('Error cancelling purchase:', error);
    throw error;
  }
}

export async function fetchClientVouchers(): Promise<Voucher[]> {
  const { data: vouchers, error } = await supabase
    .from('client_vouchers')
    .select(`
      voucher_id,
      vouchers (
        id,
        code,
        plan_id,
        is_used,
        plans (
          duration
        )
      )
    `);

  if (error) {
    console.error('Error fetching vouchers:', error);
    throw error;
  }

  return vouchers
    .map(cv => cv.vouchers)
    .filter((v): v is NonNullable<typeof v> => v !== null)
    .map(v => ({
      id: v.id,
      code: v.code,
      planId: v.plan_id,
      isUsed: v.is_used
    }));
}

export async function updatePurchaseStatus(
  purchaseId: string,
  status: Database['public']['Tables']['purchases']['Row']['status']
) {
  const { error } = await supabase
    .from('purchases')
    .update({ status })
    .eq('id', purchaseId);

  if (error) {
    console.error('Error updating purchase status:', error);
    throw error;
  }
}

export async function deletePurchase(purchaseId: string) {
  const { error } = await supabase
    .from('purchases')
    .delete()
    .eq('id', purchaseId);

  if (error) {
    console.error('Error deleting purchase:', error);
    throw error;
  }
}