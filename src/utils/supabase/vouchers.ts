import { supabase } from "@/integrations/supabase/client";
import type { Voucher, Plan } from "@/types/plans";

export async function fetchVouchers(): Promise<Voucher[]> {
  const { data: vouchers, error } = await supabase
    .from('vouchers')
    .select(`
      id,
      code,
      plan_id,
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
    isUsed: false // Default to false since we're not tracking this anymore
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

  // First get the wallet entries
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
    .eq('client_id', userId)
    .eq('status', 'approved');

  if (walletError) {
    console.error('Error fetching client vouchers:', walletError);
    throw walletError;
  }

  // Filter out null vouchers and map to the correct format
  return (walletVouchers || [])
    .filter(wv => wv.vouchers !== null)
    .map(wv => ({
      id: wv.vouchers.id,
      code: wv.vouchers.code,
      planId: wv.vouchers.plan_id || '',
      isUsed: wv.status === 'used' // Use the status from voucher_wallet instead
    }));
}

export async function fetchClientPlans(): Promise<Plan[]> {
  console.log('Fetching client plans...'); // Debug log

  const { data: plans, error } = await supabase
    .from('plans')
    .select(`
      id,
      duration,
      price,
      vouchers!left (
        id
      )
    `)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }

  console.log('Raw plans data:', plans); // Debug log

  const formattedPlans = plans.map(plan => {
    // Count vouchers that are not in any wallet
    const availableVouchers = plan.vouchers ? plan.vouchers.length : 0;
    
    console.log(`Plan ${plan.duration}: Found ${availableVouchers} available vouchers`); // Debug log
    
    return {
      id: plan.id,
      duration: plan.duration,
      price: Number(plan.price),
      availableVouchers
    };
  });

  console.log('Formatted plans:', formattedPlans); // Debug log
  return formattedPlans;
}

export async function fetchAvailableVouchersCount(planId: string): Promise<number> {
  const { data: vouchers, error } = await supabase
    .from('vouchers')
    .select('id')
    .eq('plan_id', planId)
    .not('id', 'in', (
      supabase
        .from('voucher_wallet')
        .select('voucher_id')
    ));

  if (error) {
    console.error('Error fetching available vouchers count:', error);
    throw error;
  }

  return (vouchers || []).length;
}