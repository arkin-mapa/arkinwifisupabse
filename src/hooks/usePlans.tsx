import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Plan } from "@/types/plans";

export const usePlans = () => {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wifi_plans")
        .select("*")
        .order("price");

      if (error) throw error;
      
      return data.map(plan => ({
        id: plan.id,
        duration: plan.duration,
        price: plan.price,
        availableVouchers: plan.available_vouchers
      })) as Plan[];
    },
  });
};