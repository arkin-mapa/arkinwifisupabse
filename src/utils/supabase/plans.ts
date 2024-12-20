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
  const { count, error } = await supabase
    .from('vouchers')
    .select('*', { count: 'exact', head: true })
    .eq('plan_id', planId)
    .eq('is_used', false)
    .not('id', 'in', (
      supabase
        .from('voucher_wallet')
        .select('voucher_id')
    ));

  if (error) {
    console.error('Error counting vouchers for plan:', error);
    throw error;
  }

  return count || 0;
}

export async function fetchClientPlans(): Promise<Plan[]> {
  // First, fetch all plans
  const { data: plans, error: plansError } = await supabase
    .from('plans')
    .select('*')
    .order('duration');

  if (plansError) {
    console.error('Error fetching plans:', plansError);
    throw plansError;
  }

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
}