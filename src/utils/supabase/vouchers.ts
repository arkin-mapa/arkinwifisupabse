import { supabase } from "@/integrations/supabase/client";
import type { Voucher } from "@/types/plans";

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