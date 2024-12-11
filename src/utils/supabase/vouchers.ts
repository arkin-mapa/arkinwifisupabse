import { supabase } from "@/integrations/supabase/client";
import type { Voucher, Plan } from "@/types/plans";

export async function fetchVouchers(): Promise<Voucher[]> {
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

  return (vouchers || []).map(v => ({
    id: v.id,
    code: v.code,
    planId: v.plan_id || '',
    isUsed: v.is_used || false
  }));
}

export async function fetchClientPlans(): Promise<Plan[]> {
  const { data: plans, error } = await supabase
    .from('plans')
    .select(`
      id,
      duration,
      price,
      vouchers!left (
        id,
        is_used
      )
    `)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }

  return plans.map(plan => {
    const availableVouchers = plan.vouchers 
      ? plan.vouchers.filter(v => v.is_used === false).length 
      : 0;
    
    return {
      id: plan.id,
      duration: plan.duration,
      price: Number(plan.price),
      availableVouchers
    };
  });
}

export async function addVouchers(data: { code: string; plan_id: string }): Promise<void> {
  const { error } = await supabase
    .from('vouchers')
    .insert([data]);

  if (error) {
    console.error('Error adding voucher:', error);
    throw error;
  }
}

export async function deleteVoucher(voucherId: string): Promise<void> {
  const { error } = await supabase
    .from('vouchers')
    .delete()
    .eq('id', voucherId);

  if (error) {
    console.error('Error deleting voucher:', error);
    throw error;
  }
}

export async function fetchClientVouchers(): Promise<Voucher[]> {
  const { data: vouchers, error } = await supabase
    .from('vouchers')
    .select(`
      id,
      code,
      plan_id,
      is_used
    `)
    .eq('is_used', false);

  if (error) {
    console.error('Error fetching client vouchers:', error);
    throw error;
  }

  return (vouchers || []).map(v => ({
    id: v.id,
    code: v.code,
    planId: v.plan_id || '',
    isUsed: v.is_used || false
  }));
}

export async function fetchAvailableVouchersCount(planId: string): Promise<number> {
  const { data: vouchers, error } = await supabase
    .from('vouchers')
    .select('id')
    .eq('plan_id', planId)
    .eq('is_used', false);

  if (error) {
    console.error('Error fetching available vouchers count:', error);
    throw error;
  }

  return (vouchers || []).length;
}
