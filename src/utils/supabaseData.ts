import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/types/database.types";
import type { Plan, Voucher, Purchase } from "@/types/plans";

export async function fetchPlans(): Promise<Plan[]> {
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

export async function createPlan(plan: Omit<Plan, 'id' | 'availableVouchers'>) {
  const { data, error } = await supabase
    .from('plans')
    .insert([{
      duration: plan.duration,
      price: plan.price
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating plan:', error);
    throw error;
  }

  return data;
}

export async function deletePlan(planId: string) {
  const { error } = await supabase
    .from('plans')
    .delete()
    .eq('id', planId);

  if (error) {
    console.error('Error deleting plan:', error);
    throw error;
  }
}

export async function fetchVouchers(): Promise<Record<string, Voucher[]>> {
  const { data: vouchers, error } = await supabase
    .from('vouchers')
    .select(`
      id,
      code,
      plan_id,
      is_used,
      plans (
        duration
      )
    `);

  if (error) {
    console.error('Error fetching vouchers:', error);
    throw error;
  }

  const vouchersByPlan: Record<string, Voucher[]> = {};
  vouchers.forEach(v => {
    if (v.plans?.duration) {
      if (!vouchersByPlan[v.plans.duration]) {
        vouchersByPlan[v.plans.duration] = [];
      }
      vouchersByPlan[v.plans.duration].push({
        id: v.id,
        code: v.code,
        planId: v.plan_id,
        isUsed: v.is_used || false
      });
    }
  });

  return vouchersByPlan;
}

export async function addVouchers(planId: string, codes: string[]) {
  const { error } = await supabase
    .from('vouchers')
    .insert(codes.map(code => ({
      code,
      plan_id: planId,
      is_used: false
    })));

  if (error) {
    console.error('Error adding vouchers:', error);
    throw error;
  }
}

export async function deleteVoucher(voucherId: string) {
  const { error } = await supabase
    .from('vouchers')
    .delete()
    .eq('id', voucherId);

  if (error) {
    console.error('Error deleting voucher:', error);
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