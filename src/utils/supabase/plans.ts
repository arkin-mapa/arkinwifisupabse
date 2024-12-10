import { supabase } from "@/integrations/supabase/client";
import type { Plan } from "@/types/plans";

export async function fetchPlans(): Promise<Plan[]> {
  const { data: plans, error } = await supabase
    .from('plans')
    .select(`
      id,
      duration,
      price,
      vouchers (
        id,
        is_used
      )
    `)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }

  return plans.map(plan => ({
    id: plan.id,
    duration: plan.duration,
    price: Number(plan.price),
    availableVouchers: plan.vouchers?.filter(v => !v.is_used).length ?? 0
  }));
}

// Alias for client-side use
export const fetchClientPlans = fetchPlans;

export async function createPlan(data: { duration: string; price: number }) {
  const { error } = await supabase
    .from('plans')
    .insert([data]);

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