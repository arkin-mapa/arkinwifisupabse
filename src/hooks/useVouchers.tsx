import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Voucher } from "@/types/plans";

export const useVouchers = () => {
  return useQuery({
    queryKey: ["vouchers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vouchers")
        .select(`
          *,
          wifi_plans (
            id,
            duration
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map(voucher => ({
        id: voucher.id,
        code: voucher.code,
        planId: voucher.wifi_plans.id,
        isUsed: voucher.is_used || false,
      })) as Voucher[];
    },
  });
};