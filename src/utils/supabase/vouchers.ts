import { supabase } from "@/integrations/supabase/client";
import type { Voucher } from "@/types/plans";

export async function generateVouchers(planId: string, quantity: number): Promise<void> {
  // Implementation for generating vouchers
  const { error } = await supabase
    .from('vouchers')
    .insert(Array.from({ length: quantity }, () => ({
      plan_id: planId,
      is_used: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })));

  if (error) {
    console.error('Error generating vouchers:', error);
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

export async function fetchAvailableVouchers(): Promise<Record<string, number>> {
  const { data: availableVouchers, error } = await supabase
    .from('vouchers')
    .select('plan_id, count(*)')
    .eq('is_used', false)
    .group('plan_id');

  if (error) {
    console.error('Error fetching available vouchers:', error);
    return {};
  }

  return availableVouchers.reduce((acc, { plan_id, count }) => {
    acc[plan_id] = count;
    return acc;
  }, {} as Record<string, number>);
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
