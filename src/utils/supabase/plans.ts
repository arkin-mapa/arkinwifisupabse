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
    // First, get the total count of vouchers for this plan that aren't used
    const { count: totalCount, error: totalError } = await supabase
      .from('vouchers')
      .select('*', { count: 'exact', head: true })
      .eq('plan_id', planId)
      .eq('is_used', false);

    if (totalError) throw totalError;

    // Then, get the count of vouchers that are in wallets
    const { count: walletCount, error: walletError } = await supabase
      .from('voucher_wallet')
      .select('voucher_id', { count: 'exact' })
      .eq('voucher_id', supabase
        .from('vouchers')
        .select('id')
        .eq('plan_id', planId)
        .eq('is_used', false));

    if (walletError) throw walletError;

    // Available vouchers are total vouchers minus those in wallets
    const availableCount = (totalCount || 0) - (walletCount || 0);
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