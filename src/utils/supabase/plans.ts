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
    console.log(`Counting available vouchers for plan ${planId}`);
    
    // Count vouchers that are not used and not in any wallet
    const { count, error } = await supabase
      .from('vouchers')
      .select('*', { count: 'exact', head: true })
      .eq('plan_id', planId)
      .eq('is_used', false)
      .not('id', 'in', 
        supabase
          .from('voucher_wallet')
          .select('voucher_id')
      );

    if (error) {
      console.error('Error counting available vouchers:', error);
      return 0;
    }

    console.log(`Plan ${planId}: ${count || 0} vouchers available`);
    return count || 0;
  } catch (error) {
    console.error('Unexpected error in fetchAvailableVouchersCount:', error);
    return 0;
  }
}

export async function fetchClientPlans(): Promise<Plan[]> {
  try {
    const { data: plans, error: plansError } = await supabase
      .from('plans')
      .select('*')
      .order('duration');

    if (plansError) throw plansError;
    if (!plans) return [];

    const plansWithCounts = await Promise.all(
      plans.map(async (plan) => {
        const availableCount = await fetchAvailableVouchersCount(plan.id);
        console.log(`Plan ${plan.duration}: ${availableCount} vouchers available`);
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