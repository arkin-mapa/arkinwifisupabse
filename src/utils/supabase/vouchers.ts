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
  // Only fetch vouchers that are in the client's wallet
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
    .eq('client_id', (await supabase.auth.getUser()).data.user?.id);

  if (error) {
    console.error('Error fetching vouchers:', error);
    throw error;
  }

  const vouchersByPlan: Record<string, Voucher[]> = {};
  
  walletVouchers.forEach(wv => {
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
