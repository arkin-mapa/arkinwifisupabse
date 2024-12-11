import { supabase } from "@/integrations/supabase/client";
import type { Voucher } from "@/types/plans";

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

export async function addVouchers(planId: string, codes: string[]): Promise<void> {
  const { error } = await supabase
    .from('vouchers')
    .insert(
      codes.map(code => ({
        code,
        plan_id: planId,
        is_used: false
      }))
    );

  if (error) {
    console.error('Error adding vouchers:', error);
    throw error;
  }
}

export async function fetchClientVouchers(): Promise<Record<string, Voucher[]>> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user?.id) {
    console.error('Error getting authenticated user:', authError);
    return {};
  }

  const { data: walletVouchers, error } = await supabase
    .from('voucher_wallet')
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
    `)
    .eq('client_id', user.id);

  if (error) {
    console.error('Error fetching vouchers:', error);
    return {};
  }

  const vouchersByPlan: Record<string, Voucher[]> = {};
  
  walletVouchers?.forEach(wv => {
    if (wv.vouchers?.plans?.duration) {
      const duration = wv.vouchers.plans.duration;
      if (!vouchersByPlan[duration]) {
        vouchersByPlan[duration] = [];
      }
      vouchersByPlan[duration].push({
        id: wv.vouchers.id,
        code: wv.vouchers.code,
        planId: wv.vouchers.plan_id || '',
        isUsed: wv.vouchers.is_used || false
      });
    }
  });

  return vouchersByPlan;
}

export async function fetchAvailableVouchersCount(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('vouchers')
    .select('plan_id, is_used')
    .eq('is_used', false);

  if (error) {
    console.error('Error fetching available vouchers:', error);
    return {};
  }

  return (data || []).reduce((acc: Record<string, number>, voucher) => {
    const planId = voucher.plan_id;
    if (planId) {
      acc[planId] = (acc[planId] || 0) + 1;
    }
    return acc;
  }, {});
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