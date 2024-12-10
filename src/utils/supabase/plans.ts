import { supabase } from "@/integrations/supabase/client";
import type { Plan } from "@/types/plans";

export async function fetchPlans(): Promise<Plan[]> {
  console.log('Fetching plans...'); // Debug log

  const { data: plans, error } = await supabase
    .from('plans')
    .select(`
      id,
      duration,
      price,
      vouchers!left (
        id,
        is_used
      )
    `)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }

  console.log('Raw plans data:', plans); // Debug log

  const formattedPlans = plans.map(plan => {
    const availableVouchers = plan.vouchers 
      ? plan.vouchers.filter(v => v.is_used === false).length 
      : 0;
    
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