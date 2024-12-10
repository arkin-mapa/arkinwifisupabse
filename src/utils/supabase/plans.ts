import { supabase } from "@/integrations/supabase/client";
import type { Plan } from "@/types/plans";

export async function fetchPlans(): Promise<Plan[]> {
  const { data: plans, error } = await supabase
    .from('plans')
    .select(`
      *,
      vouchers!vouchers_plan_id_fkey (
        count(*)
      )
    `)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return plans.map(plan => ({
    id: plan.id,
    duration: plan.duration,
    price: Number(plan.price),
    availableVouchers: Number(plan.vouchers?.[0]?.count ?? 0)
  }));
}

export async function fetchClientPlans(): Promise<Plan[]> {
  const { data: plans, error } = await supabase
    .from('plans')
    .select(`
      *,
      vouchers!vouchers_plan_id_fkey (
        count(*) FILTER (WHERE is_used = false)
      )
    `)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return plans.map(plan => ({
    id: plan.id,
    duration: plan.duration,
    price: Number(plan.price),
    availableVouchers: Number(plan.vouchers?.[0]?.count ?? 0)
  }));
}

export async function createPlan(plan: { duration: string; price: number }): Promise<void> {
  const { error } = await supabase
    .from('plans')
    .insert([plan]);

  if (error) throw error;
}

export async function deletePlan(planId: string): Promise<void> {
  const { error } = await supabase
    .from('plans')
    .delete()
    .eq('id', planId);

  if (error) throw error;
}