import { supabase } from "@/integrations/supabase/client";
import type { Plan } from "@/types/plans";

export const fetchAvailableVouchersCount = async (planId: string): Promise<number> => {
  try {
    // First, get total vouchers for this plan that are not used
    const { data: availableVouchers, error: vouchersError } = await supabase
      .from('vouchers')
      .select('id')
      .eq('plan_id', planId)
      .eq('is_used', false);

    if (vouchersError) {
      console.error('Error fetching available vouchers:', vouchersError);
      return 0;
    }

    // Then, get vouchers that are already in someone's wallet
    const { data: walletVouchers, error: walletError } = await supabase
      .from('voucher_wallet')
      .select('voucher_id')
      .not('voucher_id', 'is', null);

    if (walletError) {
      console.error('Error fetching wallet vouchers:', walletError);
      return 0;
    }

    // Filter out vouchers that are in wallets
    const walletVoucherIds = new Set(walletVouchers?.map(v => v.voucher_id) || []);
    const availableCount = availableVouchers?.filter(v => !walletVoucherIds.has(v.id)).length || 0;

    return availableCount;
  } catch (error) {
    console.error('Error in fetchAvailableVouchersCount:', error);
    return 0;
  }
};

export const fetchClientPlans = async (): Promise<Plan[]> => {
  try {
    const { data: plans, error: plansError } = await supabase
      .from('plans')
      .select('*')
      .order('price');

    if (plansError) {
      console.error('Error fetching plans:', plansError);
      throw plansError;
    }

    if (!plans) {
      return [];
    }

    // Fetch available voucher counts for each plan
    const plansWithVouchers = await Promise.all(
      plans.map(async (plan) => {
        try {
          console.info('Counting available vouchers for plan', plan.id);
          const availableVouchers = await fetchAvailableVouchersCount(plan.id);
          console.info(`Plan ${plan.duration}: ${availableVouchers} vouchers available`);
          
          return {
            id: plan.id,
            duration: plan.duration,
            price: Number(plan.price),
            availableVouchers
          };
        } catch (error) {
          console.error(`Error processing plan ${plan.id}:`, error);
          return {
            id: plan.id,
            duration: plan.duration,
            price: Number(plan.price),
            availableVouchers: 0
          };
        }
      })
    );

    return plansWithVouchers;
  } catch (error) {
    console.error('Error in fetchClientPlans:', error);
    throw error;
  }
};