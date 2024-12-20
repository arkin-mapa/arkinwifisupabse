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
    // Get all vouchers for this plan that aren't used
    const { data: vouchers, error: vouchersError } = await supabase
      .from('vouchers')
      .select('id')
      .eq('plan_id', planId)
      .eq('is_used', false);

    if (vouchersError) throw vouchersError;
    if (!vouchers) return 0;

    // Get vouchers that are in wallets
    const { data: walletVouchers, error: walletError } = await supabase
      .from('voucher_wallet')
      .select('voucher_id')
      .in('voucher_id', vouchers.map(v => v.id));

    if (walletError) throw walletError;

    // Calculate available vouchers by subtracting wallet vouchers from total vouchers
    const availableCount = vouchers.length - (walletVouchers?.length || 0);
    return Math.max(0, availableCount); // Ensure we don't return negative numbers
  } catch (error) {
    console.error('Error counting available vouchers:', error);
    return 0; // Return 0 instead of throwing to prevent UI breaks
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
