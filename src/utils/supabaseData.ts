import { supabase } from "@/integrations/supabase/client";
import type { Plan, Voucher, Purchase } from "@/types/plans";

export async function fetchPlans() {
  const { data: plans, error } = await supabase
    .from('plans')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return plans;
}

export async function createPlan(plan: Omit<Plan, 'id' | 'availableVouchers'>) {
  const { data, error } = await supabase
    .from('plans')
    .insert([{ duration: plan.duration, price: plan.price }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePlan(planId: string) {
  const { error } = await supabase
    .from('plans')
    .delete()
    .eq('id', planId);

  if (error) throw error;
}

export async function fetchVouchers() {
  const { data: vouchers, error } = await supabase
    .from('vouchers')
    .select(`
      *,
      plan:plans(duration)
    `);

  if (error) throw error;

  // Transform data to match the expected format
  const groupedVouchers: Record<string, Voucher[]> = {};
  vouchers.forEach((v) => {
    const planDuration = v.plan?.duration;
    if (planDuration) {
      if (!groupedVouchers[planDuration]) {
        groupedVouchers[planDuration] = [];
      }
      groupedVouchers[planDuration].push({
        id: v.id,
        code: v.code,
        planId: v.plan_id,
        isUsed: v.is_used
      });
    }
  });

  return groupedVouchers;
}

export async function addVouchers(planId: string, codes: string[]) {
  const vouchers = codes.map(code => ({
    code,
    plan_id: planId,
    is_used: false
  }));

  const { data, error } = await supabase
    .from('vouchers')
    .insert(vouchers)
    .select();

  if (error) throw error;
  return data;
}

export async function deleteVoucher(voucherId: string) {
  const { error } = await supabase
    .from('vouchers')
    .delete()
    .eq('id', voucherId);

  if (error) throw error;
}

export async function fetchPurchases() {
  const { data: purchases, error } = await supabase
    .from('purchases')
    .select(`
      *,
      plan:plans(duration)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return purchases.map(p => ({
    id: p.id,
    date: new Date(p.created_at).toLocaleDateString(),
    customerName: p.customer_name,
    plan: p.plan?.duration || '',
    quantity: p.quantity,
    total: p.total_amount,
    paymentMethod: p.payment_method,
    status: p.status
  }));
}

export async function updatePurchaseStatus(purchaseId: string, status: Purchase['status']) {
  const { error } = await supabase
    .from('purchases')
    .update({ status })
    .eq('id', purchaseId);

  if (error) throw error;
}

export async function deletePurchase(purchaseId: string) {
  const { error } = await supabase
    .from('purchases')
    .delete()
    .eq('id', purchaseId);

  if (error) throw error;
}