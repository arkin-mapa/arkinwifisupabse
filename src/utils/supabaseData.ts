import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/types/database.types";
import type { Plan, Voucher, Purchase } from "@/types/plans";

export async function fetchPlans(): Promise<Plan[]> {
  const { data: plans, error } = await supabase
    .from('plans')
    .select(`
      *,
      vouchers!vouchers_plan_id_fkey (
        count(*)
      )
    `)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return plans.map(plan => ({
    id: plan.id,
    duration: plan.duration,
    price: Number(plan.price),
    availableVouchers: Number(plan.vouchers?.[0]?.count ?? 0)
  }));
}

export async function fetchClientPlans(): Promise<Plan[]> {
  const { data: plans, error } = await supabase
    .from('plans')
    .select(`
      *,
      vouchers!vouchers_plan_id_fkey (
        count(*) FILTER (WHERE is_used = false)
      )
    `)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return plans.map(plan => ({
    id: plan.id,
    duration: plan.duration,
    price: Number(plan.price),
    availableVouchers: Number(plan.vouchers?.[0]?.count ?? 0)
  }));
}

export async function createPlan(plan: { duration: string; price: number }): Promise<void> {
  const { error } = await supabase
    .from('plans')
    .insert([plan]);

  if (error) throw error;
}

export async function deletePlan(planId: string): Promise<void> {
  const { error } = await supabase
    .from('plans')
    .delete()
    .eq('id', planId);

  if (error) throw error;
}

export async function fetchVouchers(): Promise<Record<string, Voucher[]>> {
  const { data: vouchers, error } = await supabase
    .from('vouchers')
    .select(`
      *,
      plans (
        duration
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const groupedVouchers: Record<string, Voucher[]> = {};
  
  if (vouchers) {
    vouchers.forEach(voucher => {
      const duration = voucher.plans?.duration || 'unknown';
      if (!groupedVouchers[duration]) {
        groupedVouchers[duration] = [];
      }
      groupedVouchers[duration].push({
        id: voucher.id,
        code: voucher.code,
        planId: voucher.plan_id || '',
        isUsed: voucher.is_used || false
      });
    });
  }

  return groupedVouchers;
}

export async function addVouchers(planId: string, codes: string[]): Promise<void> {
  const vouchers = codes.map(code => ({
    code,
    plan_id: planId,
    is_used: false
  }));

  const { error } = await supabase
    .from('vouchers')
    .insert(vouchers);

  if (error) throw error;
}

export async function deleteVoucher(voucherId: string): Promise<void> {
  const { error } = await supabase
    .from('vouchers')
    .delete()
    .eq('id', voucherId);

  if (error) throw error;
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
  paymentMethod: Database["public"]["Enums"]["payment_method"];
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

export async function fetchClientVouchers(): Promise<Voucher[]> {
  const { data: vouchers, error } = await supabase
    .from('vouchers')
    .select(`
      *,
      plans (
        duration
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return vouchers.map(voucher => ({
    id: voucher.id,
    code: voucher.code,
    planId: voucher.plan_id || '',
    isUsed: voucher.is_used || false
  }));
}