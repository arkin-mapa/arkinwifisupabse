import { supabase } from "@/integrations/supabase/client";
import type { Voucher } from "@/types/plans";

export async function fetchVouchers(): Promise<Voucher[]> {
  const { data: vouchers, error } = await supabase
    .from('vouchers')
    .select(`
      id,
      code,
      plan_id,
      voucher_wallet!left (
        status
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
    isUsed: v.voucher_wallet?.[0]?.status === 'approved'
  }));
}

export async function addVouchers(planId: string, codes: string[]): Promise<void> {
  const vouchersToInsert = codes.map(code => ({
    code,
    plan_id: planId
  }));

  const { error } = await supabase
    .from('vouchers')
    .insert(vouchersToInsert);

  if (error) {
    console.error('Error adding vouchers:', error);
    throw error;
  }
}

export async function deleteVoucher(voucherId: string): Promise<void> {
  // First delete from voucher_wallet if it exists there
  const { error: walletError } = await supabase
    .from('voucher_wallet')
    .delete()
    .eq('voucher_id', voucherId);

  if (walletError) {
    console.error('Error deleting from voucher_wallet:', walletError);
    throw walletError;
  }

  // Then delete from vouchers table
  const { error: voucherError } = await supabase
    .from('vouchers')
    .delete()
    .eq('id', voucherId);

  if (voucherError) {
    console.error('Error deleting from vouchers:', voucherError);
    throw voucherError;
  }
}

export async function fetchClientVouchers(): Promise<Voucher[]> {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;

  if (!userId) {
    throw new Error('User must be logged in to fetch vouchers');
  }

  const { data: walletVouchers, error: walletError } = await supabase
    .from('voucher_wallet')
    .select(`
      voucher_id,
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

  return (walletVouchers || [])
    .filter(wv => wv.vouchers !== null)
    .map(wv => ({
      id: wv.vouchers.id,
      code: wv.vouchers.code,
      planId: wv.vouchers.plan_id || '',
      isUsed: wv.status === 'approved'
    }));
}

export async function fetchAvailableVouchersCount(planId: string): Promise<number> {
  const { data: vouchers, error } = await supabase
    .from('vouchers')
    .select(`
      id,
      voucher_wallet!left (
        status
      )
    `)
    .eq('plan_id', planId)
    .not('voucher_wallet.status', 'eq', 'approved');

  if (error) {
    console.error('Error fetching available vouchers count:', error);
    throw error;
  }

  return (vouchers || []).length;
}