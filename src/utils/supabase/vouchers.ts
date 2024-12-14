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
        id,
        duration,
        price
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
    isUsed: v.is_used || false,
    plan: v.plans ? {
      id: v.plans.id,
      duration: v.plans.duration,
      price: v.plans.price,
      availableVouchers: 0
    } : undefined
  }));
}

export async function deleteVoucher(voucherId: string): Promise<void> {
  const { error } = await supabase
    .from('voucher_wallet')
    .delete()
    .eq('voucher_id', voucherId);

  if (error) {
    console.error('Error deleting voucher from wallet:', error);
    throw error;
  }
}

export async function fetchClientVouchers(): Promise<Voucher[]> {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;

  if (!userId) {
    throw new Error('User must be logged in to fetch vouchers');
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
          id,
          duration,
          price
        )
      )
    `)
    .eq('client_id', userId)
    .eq('status', 'approved');

  if (error) {
    console.error('Error fetching client vouchers:', error);
    throw error;
  }

  return (walletVouchers || []).map(wv => ({
    id: wv.vouchers.id,
    code: wv.vouchers.code,
    planId: wv.vouchers.plan_id || '',
    isUsed: wv.vouchers.is_used || false,
    plan: wv.vouchers.plans ? {
      id: wv.vouchers.plans.id,
      duration: wv.vouchers.plans.duration,
      price: wv.vouchers.plans.price,
      availableVouchers: 0
    } : undefined
  }));
}