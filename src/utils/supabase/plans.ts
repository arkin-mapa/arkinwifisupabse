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
    // Get count of all unused vouchers for this plan
    const { count: totalCount, error: vouchersError } = await supabase
      .from('vouchers')
      .select('*', { count: 'exact' })
      .eq('plan_id', planId)
      .eq('is_used', false);

    if (vouchersError) {
      console.error('Error fetching unused vouchers:', vouchersError);
      return 0;
    }

    // Get count of vouchers in wallets
    const { count: walletCount, error: walletError } = await supabase
      .from('voucher_wallet')
      .select('*', { count: 'exact' })
      .eq('status', 'pending')
      .in('voucher_id', 
        supabase
          .from('vouchers')
          .select('id')
          .eq('plan_id', planId)
          .eq('is_used', false)
      );

    if (walletError) {
      console.error('Error fetching wallet vouchers:', walletError);
      return 0;
    }

    const availableCount = (totalCount || 0) - (walletCount || 0);
    console.log(`Plan ${planId}: Total=${totalCount}, Wallet=${walletCount}, Available=${availableCount}`);
    return Math.max(0, availableCount);
  } catch (error) {
    console.error('Error counting available vouchers:', error);
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