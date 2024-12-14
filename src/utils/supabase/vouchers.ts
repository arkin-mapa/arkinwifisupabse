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
        id,
        duration,
        price
      )
    `);

  if (error) {
    console.error('Error fetching vouchers:', error);
    throw error;
  }

  return vouchers.map(v => ({
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

export async function addVouchers(planId: string, quantity: number): Promise<void> {
  const vouchers = Array.from({ length: quantity }, () => ({
    code: Math.random().toString(36).substring(2, 8).toUpperCase(),
    plan_id: planId,
    is_used: false
  }));

  const { error } = await supabase
    .from('vouchers')
    .insert(vouchers);

  if (error) {
    console.error('Error adding vouchers:', error);
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
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error('Error getting user:', userError);
    throw userError;
  }

  if (!user) {
    throw new Error('No user found');
  }

  const { data: walletVouchers, error } = await supabase
    .from('voucher_wallet')
    .select(`
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
    .eq('client_id', user.id);

  if (error) {
    console.error('Error fetching client vouchers:', error);
    throw error;
  }

  return walletVouchers.map(wv => ({
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