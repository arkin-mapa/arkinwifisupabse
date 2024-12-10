import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/types/database.types";
import type { Plan, Voucher, Purchase } from "@/types/plans";

export async function fetchClientPlans(): Promise<Plan[]> {
  const { data: plans, error } = await supabase
    .from('plans')
    .select('*, vouchers(count)')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }

  return plans.map(plan => ({
    id: plan.id,
    duration: plan.duration,
    price: Number(plan.price),
    availableVouchers: plan.vouchers?.[0]?.count ?? 0
  }));
}

export async function createPurchase(purchase: {
  customerName: string;
  planId: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'gcash' | 'paymaya';
}) {
  const { data, error } = await supabase
    .from('purchases')
    .insert([{
      customer_name: purchase.customerName,
      plan_id: purchase.planId,
      quantity: purchase.quantity,
      total_amount: purchase.totalAmount,
      payment_method: purchase.paymentMethod,
      user_id: (await supabase.auth.getUser()).data.user?.id
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
  const { data: clientVouchers, error } = await supabase
    .from('client_vouchers')
    .select(`
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

  return clientVouchers
    .map(cv => cv.vouchers)
    .filter((v): v is NonNullable<typeof v> => v !== null)
    .map(v => ({
      id: v.id,
      code: v.code,
      planId: v.plan_id || '',
      isUsed: v.is_used || false
    }));
}