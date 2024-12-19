import { supabase } from "@/integrations/supabase/client";
import type { Plan } from "@/types/plans";

export async function fetchPlans() {
  const { data: plans, error } = await supabase
    .from('plans')
    .select('*')
    .order('price');

  if (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }

  return plans;
}

export async function createPlan(duration: string, price: number) {
  const { data, error } = await supabase
    .from('plans')
    .insert([{ duration, price }])
    .select()
    .single();

  if (error) {
    console.error('Error creating plan:', error);
    throw error;
  }

  return data;
}

export async function deletePlan(id: string) {
  const { error } = await supabase
    .from('plans')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting plan:', error);
    throw error;
  }
}

export async function fetchClientPlans(): Promise<Plan[]> {
  // First get all plans
  const { data: plans, error: plansError } = await supabase
    .from('plans')
    .select('*')
    .order('price');

  if (plansError) {
    console.error('Error fetching plans:', plansError);
    throw plansError;
  }

  // For each plan, count available vouchers
  const plansWithVouchers = await Promise.all(plans.map(async (plan) => {
    console.log(`Plan ${plan.duration}: Checking available vouchers`);
    
    // First get all voucher IDs that are already in wallets
    const { data: walletVouchers } = await supabase
      .from('voucher_wallet')
      .select('voucher_id');
    
    const usedVoucherIds = walletVouchers?.map(v => v.voucher_id) || [];
    
    // Then count available vouchers excluding those in wallets and those marked as used
    const { count, error: countError } = await supabase
      .from('vouchers')
      .select('*', { count: 'exact', head: true })
      .eq('plan_id', plan.id)
      .eq('is_used', false)
      .not('id', 'in', usedVoucherIds);

    if (countError) {
      console.error(`Error counting vouchers for plan ${plan.duration}:`, countError);
      throw countError;
    }

    console.log(`Plan ${plan.duration}: Found ${count} available vouchers`);

    return {
      id: plan.id,
      duration: plan.duration,
      price: plan.price,
      availableVouchers: count || 0
    };
  }));

  console.log('Formatted plans:', plansWithVouchers);
  return plansWithVouchers;
}