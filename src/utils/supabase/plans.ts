import { supabase } from "@/integrations/supabase/client";
import type { Plan } from "@/types/plans";

export async function fetchPlans(): Promise<Plan[]> {
  const { data: plans, error } = await supabase
    .from('plans')
    .select('*')
    .order('duration');

  if (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }

  return plans.map(plan => ({
    id: plan.id,
    duration: plan.duration,
    price: Number(plan.price),
    availableVouchers: 0 // This will be updated by fetchAvailableVouchersCount
  }));
}

export async function createPlan(duration: string, price: number) {
  const { error } = await supabase
    .from('plans')
    .insert([{ duration, price }]);

  if (error) {
    console.error('Error creating plan:', error);
    throw error;
  }
}

export async function deletePlan(planId: string) {
  const { error } = await supabase
    .from('plans')
    .delete()
    .eq('id', planId);

  if (error) {
    console.error('Error deleting plan:', error);
    throw error;
  }
}

export async function fetchAvailableVouchersCount(planId: string): Promise<number> {
  try {
    // First get all unused vouchers for this plan
    const { data: unusedVouchers, error: vouchersError } = await supabase
      .from('vouchers')
      .select('*')  // Changed from just 'id' to '*' to get all voucher data
      .eq('plan_id', planId)
      .eq('is_used', false);

    if (vouchersError) {
      console.error('Error fetching unused vouchers:', vouchersError);
      return 0;
    }

    if (!unusedVouchers || unusedVouchers.length === 0) {
      return 0;
    }

    // Then check which of these vouchers are in wallets
    const { data: walletVouchers, error: walletError } = await supabase
      .from('voucher_wallet')
      .select('*')  // Changed from just 'voucher_id' to '*' to get all wallet data
      .in('voucher_id', unusedVouchers.map(v => v.id));

    if (walletError) {
      console.error('Error fetching wallet vouchers:', walletError);
      return 0;
    }

    // Calculate available vouchers
    const walletVoucherCount = walletVouchers?.length || 0;
    return Math.max(0, unusedVouchers.length - walletVoucherCount);
  } catch (error) {
    console.error('Error counting available vouchers:', error);
    return 0;
  }
}

export async function fetchClientPlans(): Promise<Plan[]> {
  try {
    // First, fetch all plans
    const { data: plans, error: plansError } = await supabase
      .from('plans')
      .select('*')
      .order('duration');

    if (plansError) throw plansError;
    if (!plans) return [];

    // Then, for each plan, count available vouchers
    const plansWithCounts = await Promise.all(
      plans.map(async (plan) => {
        const availableCount = await fetchAvailableVouchersCount(plan.id);
        console.log(`Plan ${plan.duration}: ${availableCount} vouchers available`); // Debug log
        return {
          id: plan.id,
          duration: plan.duration,
          price: Number(plan.price),
          availableVouchers: availableCount
        };
      })
    );

    return plansWithCounts;
  } catch (error) {
    console.error('Error fetching client plans:', error);
    return [];
  }
}