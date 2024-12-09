import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Purchase } from "@/types/plans";

export const usePurchases = () => {
  const queryClient = useQueryClient();

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ["purchases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchases")
        .select(`
          *,
          wifi_plans (
            duration,
            price
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map(purchase => ({
        id: purchase.id,
        date: new Date(purchase.created_at).toISOString().split('T')[0],
        plan: purchase.wifi_plans.duration,
        quantity: purchase.quantity,
        total: purchase.total,
        paymentMethod: purchase.payment_method,
        status: purchase.status
      })) as Purchase[];
    },
  });

  const cancelPurchase = useMutation({
    mutationFn: async (purchaseId: string) => {
      const { error } = await supabase
        .from("purchases")
        .update({ status: "cancelled" })
        .eq("id", purchaseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      toast.success("Purchase cancelled successfully");
    },
    onError: () => {
      toast.error("Failed to cancel purchase");
    },
  });

  const deletePurchase = useMutation({
    mutationFn: async (purchaseId: string) => {
      const { error } = await supabase
        .from("purchases")
        .delete()
        .eq("id", purchaseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      toast.success("Purchase record deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete purchase record");
    },
  });

  return {
    purchases,
    isLoading,
    cancelPurchase,
    deletePurchase,
  };
};