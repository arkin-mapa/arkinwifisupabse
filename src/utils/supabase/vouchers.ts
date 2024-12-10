import { supabase } from "@/integrations/supabase/client";
import type { Voucher } from "@/types/plans";

export async function fetchVouchers(planId?: string): Promise<Voucher[]> {
  let query = supabase
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

  if (planId) {
    query = query.eq('plan_id', planId);
  }

  const { data: vouchers, error } = await query;

  if (error) {
    console.error('Error fetching vouchers:', error);
    throw error;
  }

  return vouchers.map(v => ({
    id: v.id,
    code: v.code,
    planId: v.plan_id || '',
    isUsed: v.is_used || false
  }));
}

export async function fetchClientVouchers(): Promise<Record<string, Voucher[]>> {
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
        planId: v.plan_id || '',
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