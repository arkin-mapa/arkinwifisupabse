import { supabase } from "@/integrations/supabase/client";
import type { Voucher } from "@/types/plans";

export async function fetchVouchers(): Promise<Voucher[]> {
  const { data: vouchers, error } = await supabase
    .from('vouchers')
    .select('*');

  if (error) {
    console.error('Error fetching vouchers:', error);
    throw error;
  }

  return vouchers.map(voucher => ({
    id: voucher.id,
    code: voucher.code,
    planId: voucher.plan_id || '',
    isUsed: false
  }));
}

export async function addVouchers(planId: string, codes: string[]) {
  const { error } = await supabase
    .from('vouchers')
    .insert(
      codes.map(code => ({
        code,
        plan_id: planId
      }))
    );

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

export async function fetchClientVouchers(userId: string): Promise<Voucher[]> {
  const { data: walletVouchers, error: walletError } = await supabase
    .from('voucher_wallet')
    .select(`
      status,
      vouchers (
        id,
        code,
        plan_id
      )
    `)
    .eq('client_id', userId);

  if (walletError) {
    console.error('Error fetching client vouchers:', walletError);
    throw walletError;
  }

  return walletVouchers.map(wv => ({
    id: wv.vouchers?.id || '',
    code: wv.vouchers?.code || '',
    planId: wv.vouchers?.plan_id || '',
    isUsed: wv.status === 'approved'
  }));
}

export async function fetchAvailableVouchersCount(planId: string): Promise<number> {
  const { count, error } = await supabase
    .from('vouchers')
    .select('*', { count: 'exact', head: true })
    .eq('plan_id', planId)
    .not('id', 'in', (
      supabase
        .from('voucher_wallet')
        .select('voucher_id')
        .eq('status', 'approved')
    ));

  if (error) {
    console.error('Error counting available vouchers:', error);
    throw error;
  }

  return count || 0;
}